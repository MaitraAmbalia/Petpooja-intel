import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FoodItem from "@/models/FoodItem";
import VoiceOrder from "@/models/VoiceOrder";
import ProductAnalytics from "@/models/ProductAnalytics";

/**
 * POST /api/analytics/compute
 * 
 * Full recomputation pipeline:
 * 1. Fetch all FoodItems
 * 2. Aggregate VoiceOrders (last 30 days) by foodId
 * 3. Build daily history, sales metrics, velocity
 * 4. Compute price history & elasticity
 * 5. Find optimal price for profit maximization
 * 6. Classify items (Hero Item / Volume Driver / etc.)
 * 7. Upsert into ProductAnalytics
 */
export async function POST() {
    try {
        await connectDB();

        // 1. Fetch all menu items
        const foodItems = await FoodItem.find().lean();
        if (!foodItems || foodItems.length === 0) {
            return NextResponse.json({ success: false, error: "No food items found" }, { status: 404 });
        }

        // 2. Get date range (last 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // 3. Aggregate orders per item (last 30 days)
        const orderAgg = await VoiceOrder.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: {
                        foodId: "$items.foodId",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        price: "$items.price"
                    },
                    dailyOrders: { $sum: 1 },
                    dailyQty: { $sum: "$items.qty" },
                    dailyRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } }
                }
            },
            { $sort: { "_id.date": -1 } }
        ]);

        // Build lookup: foodId -> { dailyHistory, priceGroups }
        const itemDataMap: Record<string, {
            dailyHistory: Record<string, { orders: number; qty: number; revenue: number }>;
            priceGroups: Record<number, { orders: number; qty: number; revenue: number; dates: string[] }>;
            totalOrders: number;
            totalQty: number;
            totalRevenue: number;
        }> = {};

        for (const row of orderAgg) {
            const foodId = row._id.foodId;
            const date = row._id.date;
            const price = row._id.price;

            if (!itemDataMap[foodId]) {
                itemDataMap[foodId] = {
                    dailyHistory: {},
                    priceGroups: {},
                    totalOrders: 0,
                    totalQty: 0,
                    totalRevenue: 0
                };
            }

            const data = itemDataMap[foodId];

            // Daily history
            if (!data.dailyHistory[date]) {
                data.dailyHistory[date] = { orders: 0, qty: 0, revenue: 0 };
            }
            data.dailyHistory[date].orders += row.dailyOrders;
            data.dailyHistory[date].qty += row.dailyQty;
            data.dailyHistory[date].revenue += row.dailyRevenue;

            // Price groups (for price history / elasticity)
            if (!data.priceGroups[price]) {
                data.priceGroups[price] = { orders: 0, qty: 0, revenue: 0, dates: [] };
            }
            data.priceGroups[price].orders += row.dailyOrders;
            data.priceGroups[price].qty += row.dailyQty;
            data.priceGroups[price].revenue += row.dailyRevenue;
            if (!data.priceGroups[price].dates.includes(date)) {
                data.priceGroups[price].dates.push(date);
            }

            data.totalOrders += row.dailyOrders;
            data.totalQty += row.dailyQty;
            data.totalRevenue += row.dailyRevenue;
        }

        // 4. Process each food item
        const analyticsUpdates = [];
        const allMargins: number[] = [];
        const allPopularities: number[] = [];

        for (const item of foodItems) {
            const fi = item as any;
            const foodId = fi.foodId;
            const cost = fi.cost || 0;
            const currentPrice = fi.price || 0;
            const margin = currentPrice - cost;
            const marginPct = currentPrice > 0 ? (margin / currentPrice) * 100 : 0;

            const orderData = itemDataMap[foodId];

            // Sales metrics
            const totalOrders30d = orderData?.totalOrders || 0;
            const totalRevenue30d = orderData?.totalRevenue || 0;
            const totalQtySold30d = orderData?.totalQty || 0;
            const avgDailyOrders = totalOrders30d / 30;
            const salesVelocity = totalQtySold30d / 30;

            // Daily history array (sorted by date, last 30 days)
            const dailyHistory: { date: string; orders: number; qty: number; revenue: number }[] = [];
            if (orderData) {
                const sortedDates = Object.keys(orderData.dailyHistory).sort().reverse();
                for (const date of sortedDates.slice(0, 30)) {
                    dailyHistory.push({ date, ...orderData.dailyHistory[date] });
                }
            }

            // Velocity trend: compare last 7d vs prev 7-14d
            let velocityTrend: "rising" | "stable" | "declining" = "stable";
            if (dailyHistory.length >= 7) {
                const last7dQty = dailyHistory
                    .filter(d => new Date(d.date) >= sevenDaysAgo)
                    .reduce((sum, d) => sum + d.qty, 0);
                const prev7dQty = dailyHistory
                    .filter(d => new Date(d.date) >= fourteenDaysAgo && new Date(d.date) < sevenDaysAgo)
                    .reduce((sum, d) => sum + d.qty, 0);

                if (prev7dQty > 0) {
                    const change = (last7dQty - prev7dQty) / prev7dQty;
                    if (change > 0.10) velocityTrend = "rising";
                    else if (change < -0.10) velocityTrend = "declining";
                }
            }

            // Popularity Score (Weighted Moving Average - recent days weighted 3x)
            let popularityScore = 0;
            if (dailyHistory.length > 0) {
                let weightSum = 0;
                let valueSum = 0;
                for (let i = 0; i < dailyHistory.length; i++) {
                    const weight = i < 7 ? 3 : (i < 14 ? 2 : 1); // Last 7d = 3x, 7-14d = 2x, 14-30d = 1x
                    valueSum += dailyHistory[i].qty * weight;
                    weightSum += weight;
                }
                popularityScore = weightSum > 0 ? (valueSum / weightSum) * 30 : 0; // Scale to monthly
            }

            // Price history from order data
            const priceHistory: any[] = [];
            if (orderData) {
                const prices = Object.keys(orderData.priceGroups).map(Number).sort();
                for (const price of prices) {
                    const pg = orderData.priceGroups[price];
                    const sortedDates = pg.dates.sort();
                    const startDate = new Date(sortedDates[0]);
                    const endDate = price === currentPrice ? null : new Date(sortedDates[sortedDates.length - 1]);
                    const daysActive = pg.dates.length;

                    priceHistory.push({
                        price,
                        startDate,
                        endDate,
                        daysActive,
                        ordersAtPrice: pg.orders,
                        qtySoldAtPrice: pg.qty,
                        revenueAtPrice: pg.revenue,
                        avgDailyDemand: daysActive > 0 ? pg.qty / daysActive : 0
                    });
                }
            }

            // Price elasticity & optimal price
            let priceElasticity: number | null = null;
            let optimalPrice: number | null = null;
            let projectedProfitAtOptimal: number | null = null;
            let profitUplift: string | null = null;

            if (priceHistory.length >= 2) {
                // Calculate elasticity from price history data points
                // E = (% change in demand) / (% change in price)
                const sorted = [...priceHistory].sort((a, b) => a.price - b.price);
                let totalElasticity = 0;
                let elasticityCount = 0;

                for (let i = 1; i < sorted.length; i++) {
                    const priceDelta = (sorted[i].price - sorted[i - 1].price) / sorted[i - 1].price;
                    const demandDelta = (sorted[i].avgDailyDemand - sorted[i - 1].avgDailyDemand) / (sorted[i - 1].avgDailyDemand || 1);
                    if (priceDelta !== 0) {
                        totalElasticity += demandDelta / priceDelta;
                        elasticityCount++;
                    }
                }

                if (elasticityCount > 0) {
                    priceElasticity = Number((totalElasticity / elasticityCount).toFixed(2));

                    // Find optimal price by iterating through a range
                    // For each candidate price, predict demand using elasticity
                    const baseDemand = salesVelocity; // current daily demand
                    const basePrice = currentPrice;
                    let maxProfit = -Infinity;
                    let bestPrice = currentPrice;

                    // Test prices from -30% to +30% of current price
                    for (let pct = -30; pct <= 30; pct += 1) {
                        const candidatePrice = basePrice * (1 + pct / 100);
                        if (candidatePrice <= cost) continue; // Must be above cost

                        const priceChangePercent = (candidatePrice - basePrice) / basePrice;
                        const predictedDemandChange = priceChangePercent * priceElasticity;
                        const predictedDemand = baseDemand * (1 + predictedDemandChange);

                        if (predictedDemand < 0) continue;

                        const dailyProfit = (candidatePrice - cost) * predictedDemand;
                        if (dailyProfit > maxProfit) {
                            maxProfit = dailyProfit;
                            bestPrice = candidatePrice;
                        }
                    }

                    optimalPrice = Number(bestPrice.toFixed(2));
                    projectedProfitAtOptimal = Number((maxProfit * 30).toFixed(2));
                }
            }

            const currentDailyProfit = (currentPrice - cost) * salesVelocity;
            const currentMonthlyProfit = Number((currentDailyProfit * 30).toFixed(2));

            if (projectedProfitAtOptimal !== null && currentMonthlyProfit > 0) {
                const uplift = ((projectedProfitAtOptimal - currentMonthlyProfit) / currentMonthlyProfit) * 100;
                profitUplift = `${uplift >= 0 ? '+' : ''}${uplift.toFixed(1)}%`;
            }

            allMargins.push(margin);
            allPopularities.push(popularityScore);

            analyticsUpdates.push({
                foodId,
                name: fi.name,
                category: fi.category,
                currentPrice,
                cost,
                margin,
                marginPct: Number(marginPct.toFixed(1)),
                priceHistory,
                priceElasticity,
                optimalPrice,
                projectedProfitAtOptimal,
                currentMonthlyProfit,
                profitUplift,
                totalOrders30d,
                totalRevenue30d: Number(totalRevenue30d.toFixed(2)),
                totalQtySold30d,
                avgDailyOrders: Number(avgDailyOrders.toFixed(1)),
                salesVelocity: Number(salesVelocity.toFixed(1)),
                popularityScore: Number(popularityScore.toFixed(0)),
                velocityTrend,
                dailyHistory,
                lastComputedAt: now,
                computeVersion: 1
            });
        }

        // 5. Classification & Profitability Tier
        const avgMargin = allMargins.length > 0 ? allMargins.reduce((a, b) => a + b, 0) / allMargins.length : 0;
        const avgPopularity = allPopularities.length > 0 ? allPopularities.reduce((a, b) => a + b, 0) / allPopularities.length : 0;

        // Sort by margin for profitability tiers
        const sortedByMargin = [...analyticsUpdates].sort((a, b) => b.margin - a.margin);
        const q1 = Math.floor(sortedByMargin.length * 0.25);
        const q2 = Math.floor(sortedByMargin.length * 0.50);
        const q3 = Math.floor(sortedByMargin.length * 0.75);

        for (let i = 0; i < analyticsUpdates.length; i++) {
            const item = analyticsUpdates[i];

            // Classification
            if (item.margin >= avgMargin && item.popularityScore >= avgPopularity) {
                item.classification = "Hero Item";
            } else if (item.margin < avgMargin && item.popularityScore >= avgPopularity) {
                item.classification = "Volume Driver";
            } else if (item.margin >= avgMargin && item.popularityScore < avgPopularity) {
                item.classification = "Hidden Gem";
            } else {
                item.classification = "Underperformer";
            }

            // Profitability Tier
            const marginRank = sortedByMargin.findIndex(s => s.foodId === item.foodId);
            if (marginRank < q1) item.profitabilityTier = "A";
            else if (marginRank < q2) item.profitabilityTier = "B";
            else if (marginRank < q3) item.profitabilityTier = "C";
            else item.profitabilityTier = "D";
        }

        // 6. Bulk upsert into ProductAnalytics
        const bulkOps = analyticsUpdates.map(item => ({
            updateOne: {
                filter: { foodId: item.foodId },
                update: { $set: item },
                upsert: true
            }
        }));

        await ProductAnalytics.bulkWrite(bulkOps);

        return NextResponse.json({
            success: true,
            computed: analyticsUpdates.length,
            avgMargin: Number(avgMargin.toFixed(2)),
            avgPopularity: Number(avgPopularity.toFixed(0)),
            timestamp: now
        });

    } catch (error: any) {
        console.error("POST /api/analytics/compute Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
