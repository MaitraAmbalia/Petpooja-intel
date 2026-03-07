/**
 * Seed ProductAnalytics collection with realistic mock data
 * Based on existing FoodItem data from data-store.js
 * 
 * Usage: node scripts/seed_product_analytics.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI;

// ProductAnalytics Schema (inline for standalone script)
const ProductAnalyticsSchema = new mongoose.Schema({
    foodId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String },
    currentPrice: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    marginPct: { type: Number, default: 0 },
    priceHistory: [{
        price: Number, startDate: Date, endDate: Date,
        daysActive: Number, ordersAtPrice: Number, qtySoldAtPrice: Number,
        revenueAtPrice: Number, avgDailyDemand: Number
    }],
    priceElasticity: { type: Number, default: null },
    optimalPrice: { type: Number, default: null },
    projectedProfitAtOptimal: { type: Number, default: null },
    currentMonthlyProfit: { type: Number, default: 0 },
    profitUplift: { type: String, default: null },
    totalOrders30d: { type: Number, default: 0 },
    totalRevenue30d: { type: Number, default: 0 },
    totalQtySold30d: { type: Number, default: 0 },
    avgDailyOrders: { type: Number, default: 0 },
    salesVelocity: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    velocityTrend: { type: String, enum: ["rising", "stable", "declining"], default: "stable" },
    dailyHistory: [{ date: String, orders: Number, qty: Number, revenue: Number }],
    classification: { type: String, enum: ["Hero Item", "Volume Driver", "Hidden Gem", "Underperformer"], default: "Underperformer" },
    profitabilityTier: { type: String, enum: ["A", "B", "C", "D"], default: "D" },
    estimatedDaysOfStock: { type: Number, default: null },
    restockAlert: { type: Boolean, default: false },
    lastComputedAt: { type: Date, default: Date.now },
    computeVersion: { type: Number, default: 1 }
}, { timestamps: true });

const ProductAnalytics = mongoose.models.ProductAnalytics || mongoose.model("ProductAnalytics", ProductAnalyticsSchema);

// Existing food items data (from data-store.js)
const ITEMS = [
    { foodId: "mcd_101", name: "McVeggie Burger", price: 120, cost: 35, category: "Snack", orderHistory: [4500, 4032, 657] },
    { foodId: "mcd_102", name: "McChicken", price: 135, cost: 50, category: "Snack", orderHistory: [4200, 3234, 2013] },
    { foodId: "mcd_103", name: "Maharaja Mac (Veg)", price: 210, cost: 75, category: "Snack", orderHistory: [1200, 943, 873] },
    { foodId: "mcd_104", name: "Maharaja Mac (Chicken)", price: 235, cost: 95, category: "Snack", orderHistory: [1500, 2031, 2543] },
    { foodId: "mcd_105", name: "French Fries (L)", price: 110, cost: 18, category: "Snack", orderHistory: [6000, 6034, 1038] },
    { foodId: "mcd_106", name: "McNuggets (6pc)", price: 170, cost: 65, category: "Snack", orderHistory: [2100, 1032, 4937] },
    { foodId: "mcd_107", name: "Pizza McPuff", price: 55, cost: 15, category: "Snack", orderHistory: [3800, 5492, 5301] },
    { foodId: "mcd_108", name: "McAloo Tikki", price: 70, cost: 20, category: "Snack", orderHistory: [7200, 8321, 971] },
    { foodId: "mcd_109", name: "Coke (M)", price: 90, cost: 8, category: "Beverage", orderHistory: [8500, 9233, 1032] },
    { foodId: "mcd_110", name: "Cold Coffee", price: 130, cost: 30, category: "Beverage", orderHistory: [2800, 933, 742] },
    { foodId: "mcd_111", name: "Soft Serve (Cone)", price: 35, cost: 8, category: "Dessert", orderHistory: [5000, 5034, 4932] },
    { foodId: "mcd_112", name: "McFlurry Oreo", price: 115, cost: 40, category: "Dessert", orderHistory: [1900, 2001, 4500] },
    { foodId: "mcd_113", name: "Filet-O-Fish", price: 165, cost: 85, category: "Snack", orderHistory: [800, 853, 875] },
    { foodId: "mcd_114", name: "Chicken Wings (2pc)", price: 140, cost: 70, category: "Snack", orderHistory: [1100, 1283, 1433] },
    { foodId: "mcd_115", name: "Veg McMuffin", price: 100, cost: 30, category: "Snack", orderHistory: [900, 923, 1009] },
    { foodId: "mcd_116", name: "Egg McMuffin", price: 110, cost: 35, category: "Snack", orderHistory: [1150, 1223, 5932] },
    { foodId: "mcd_117", name: "Hashbrown", price: 50, cost: 12, category: "Snack", orderHistory: [2400, 3412, 623] },
    { foodId: "mcd_118", name: "Wrap (Grilled Veg)", price: 180, cost: 65, category: "Snack", orderHistory: [700, 823, 3023] },
    { foodId: "mcd_119", name: "Wrap (Grilled Chicken)", price: 210, cost: 85, category: "Snack", orderHistory: [950, 1203, 2991] },
    { foodId: "mcd_120", name: "Hot Fudge Sundae", price: 105, cost: 35, category: "Dessert", orderHistory: [2300, 2383, 991] },
    { foodId: "mcd_121", name: "Chocolate Shake", price: 140, cost: 40, category: "Beverage", orderHistory: [3500, 5932, 1483] },
    { foodId: "mcd_122", name: "Iced Tea", price: 70, cost: 20, category: "Beverage", orderHistory: [1500, 732, 3012] },
    { foodId: "mcd_123", name: "Caramel Sundae", price: 120, cost: 30, category: "Dessert", orderHistory: [2800, 4783, 5321] },
    { foodId: "mcd_124", name: "Apple Pie", price: 90, cost: 30, category: "Dessert", orderHistory: [1200, 3742, 983] },
    { foodId: "mcd_125", name: "Bottled Water", price: 40, cost: 10, category: "Beverage", orderHistory: [4500, 6734, 3231] },
];

function generateDailyHistory(orderHistory, currentPrice, days = 30) {
    // Use orderHistory WMA as base, add daily variance
    const baseDaily = (orderHistory[0] * 0.5 + orderHistory[1] * 0.3 + orderHistory[2] * 0.2) / 30;
    const history = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // Add ±30% random variance per day
        const variance = 0.7 + Math.random() * 0.6;
        const dailyOrders = Math.max(1, Math.round(baseDaily * variance));
        const avgQtyPerOrder = 1 + Math.random() * 0.5;
        const qty = Math.round(dailyOrders * avgQtyPerOrder);

        history.push({
            date: dateStr,
            orders: dailyOrders,
            qty,
            revenue: Number((qty * currentPrice).toFixed(2))
        });
    }
    return history;
}

function generatePriceHistory(currentPrice, cost, orderHistory) {
    // Simulate 2-3 past prices leading up to current
    const history = [];
    const priceVariations = [
        { pctDiff: -0.15, daysAgo: 90, duration: 30 },
        { pctDiff: -0.08, daysAgo: 60, duration: 30 },
        { pctDiff: 0, daysAgo: 30, duration: null } // current
    ];

    const baseDaily = (orderHistory[0] * 0.5 + orderHistory[1] * 0.3 + orderHistory[2] * 0.2) / 30;

    for (const variation of priceVariations) {
        const price = Math.round(currentPrice * (1 + variation.pctDiff));
        if (price <= cost) continue;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - variation.daysAgo);
        const endDate = variation.duration ? new Date(startDate) : null;
        if (endDate) endDate.setDate(endDate.getDate() + variation.duration);

        const daysActive = variation.duration || 30;
        // Higher demand at lower prices (simulating elasticity)
        const demandMultiplier = 1 + (-variation.pctDiff * 1.3);
        const avgDailyDemand = Number((baseDaily * demandMultiplier).toFixed(1));
        const totalQty = Math.round(avgDailyDemand * daysActive);

        history.push({
            price,
            startDate,
            endDate,
            daysActive,
            ordersAtPrice: Math.round(totalQty * 0.8),
            qtySoldAtPrice: totalQty,
            revenueAtPrice: totalQty * price,
            avgDailyDemand
        });
    }
    return history;
}

function computeElasticity(priceHistory, cost) {
    if (priceHistory.length < 2) return { elasticity: null, optimalPrice: null, projectedProfit: null, uplift: null };

    const sorted = [...priceHistory].sort((a, b) => a.price - b.price);
    let totalE = 0, count = 0;

    for (let i = 1; i < sorted.length; i++) {
        const pDelta = (sorted[i].price - sorted[i - 1].price) / sorted[i - 1].price;
        const dDelta = (sorted[i].avgDailyDemand - sorted[i - 1].avgDailyDemand) / (sorted[i - 1].avgDailyDemand || 1);
        if (pDelta !== 0) { totalE += dDelta / pDelta; count++; }
    }

    const elasticity = count > 0 ? Number((totalE / count).toFixed(2)) : null;
    if (!elasticity) return { elasticity: null, optimalPrice: null, projectedProfit: null, uplift: null };

    // Find optimal price
    const currentEntry = sorted[sorted.length - 1];
    const basePrice = currentEntry.price;
    const baseDemand = currentEntry.avgDailyDemand;
    let maxProfit = -Infinity, bestPrice = basePrice;

    for (let pct = -30; pct <= 30; pct++) {
        const candidatePrice = basePrice * (1 + pct / 100);
        if (candidatePrice <= cost) continue;
        const demandChange = (pct / 100) * elasticity;
        const demand = baseDemand * (1 + demandChange);
        if (demand < 0) continue;
        const profit = (candidatePrice - cost) * demand;
        if (profit > maxProfit) { maxProfit = profit; bestPrice = candidatePrice; }
    }

    const currentDailyProfit = (basePrice - cost) * baseDemand;
    const projectedProfit = Number((maxProfit * 30).toFixed(2));
    const currentMonthly = Number((currentDailyProfit * 30).toFixed(2));
    const uplift = currentMonthly > 0 ? `${(((projectedProfit - currentMonthly) / currentMonthly) * 100).toFixed(1)}%` : null;
    if (uplift && !uplift.startsWith("-")) {
        return { elasticity, optimalPrice: Number(bestPrice.toFixed(2)), projectedProfit, uplift: `+${uplift}` };
    }

    return { elasticity, optimalPrice: Number(bestPrice.toFixed(2)), projectedProfit, uplift };
}

async function seed() {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected\n");

    // Build analytics for each item
    const analytics = [];
    const allMargins = [];
    const allPopularities = [];

    for (const item of ITEMS) {
        const margin = item.price - item.cost;
        const marginPct = Number(((margin / item.price) * 100).toFixed(1));

        const dailyHistory = generateDailyHistory(item.orderHistory, item.price);
        const totalOrders30d = dailyHistory.reduce((a, d) => a + d.orders, 0);
        const totalQtySold30d = dailyHistory.reduce((a, d) => a + d.qty, 0);
        const totalRevenue30d = dailyHistory.reduce((a, d) => a + d.revenue, 0);
        const avgDailyOrders = Number((totalOrders30d / 30).toFixed(1));
        const salesVelocity = Number((totalQtySold30d / 30).toFixed(1));

        // Velocity trend
        const last7 = dailyHistory.slice(0, 7).reduce((a, d) => a + d.qty, 0);
        const prev7 = dailyHistory.slice(7, 14).reduce((a, d) => a + d.qty, 0);
        let velocityTrend = "stable";
        if (prev7 > 0) {
            const change = (last7 - prev7) / prev7;
            if (change > 0.10) velocityTrend = "rising";
            else if (change < -0.10) velocityTrend = "declining";
        }

        // Popularity (WMA: recent days 3x weight)
        let popScore = 0, wSum = 0;
        dailyHistory.forEach((d, i) => {
            const w = i < 7 ? 3 : (i < 14 ? 2 : 1);
            popScore += d.qty * w;
            wSum += w;
        });
        const popularityScore = Math.round((popScore / wSum) * 30);

        // Price history & elasticity
        const priceHistory = generatePriceHistory(item.price, item.cost, item.orderHistory);
        const { elasticity, optimalPrice, projectedProfit, uplift } = computeElasticity(priceHistory, item.cost);

        const currentDailyProfit = (item.price - item.cost) * salesVelocity;
        const currentMonthlyProfit = Number((currentDailyProfit * 30).toFixed(2));

        allMargins.push(margin);
        allPopularities.push(popularityScore);

        analytics.push({
            foodId: item.foodId,
            name: item.name,
            category: item.category,
            currentPrice: item.price,
            cost: item.cost,
            margin, marginPct,
            priceHistory,
            priceElasticity: elasticity,
            optimalPrice,
            projectedProfitAtOptimal: projectedProfit,
            currentMonthlyProfit,
            profitUplift: uplift,
            totalOrders30d, totalRevenue30d: Number(totalRevenue30d.toFixed(2)),
            totalQtySold30d, avgDailyOrders, salesVelocity,
            popularityScore, velocityTrend,
            dailyHistory,
            lastComputedAt: new Date(),
            computeVersion: 1
        });
    }

    // Classification & tiers
    const avgMargin = allMargins.reduce((a, b) => a + b, 0) / allMargins.length;
    const avgPop = allPopularities.reduce((a, b) => a + b, 0) / allPopularities.length;

    const sortedByMargin = [...analytics].sort((a, b) => b.margin - a.margin);
    const q1 = Math.floor(sortedByMargin.length * 0.25);
    const q2 = Math.floor(sortedByMargin.length * 0.50);
    const q3 = Math.floor(sortedByMargin.length * 0.75);

    for (const item of analytics) {
        if (item.margin >= avgMargin && item.popularityScore >= avgPop) item.classification = "Hero Item";
        else if (item.margin < avgMargin && item.popularityScore >= avgPop) item.classification = "Volume Driver";
        else if (item.margin >= avgMargin && item.popularityScore < avgPop) item.classification = "Hidden Gem";
        else item.classification = "Underperformer";

        const rank = sortedByMargin.findIndex(s => s.foodId === item.foodId);
        if (rank < q1) item.profitabilityTier = "A";
        else if (rank < q2) item.profitabilityTier = "B";
        else if (rank < q3) item.profitabilityTier = "C";
        else item.profitabilityTier = "D";
    }

    // Upsert into DB
    console.log("📊 Seeding ProductAnalytics...\n");

    for (const doc of analytics) {
        await ProductAnalytics.findOneAndUpdate(
            { foodId: doc.foodId },
            { $set: doc },
            { upsert: true, new: true }
        );
        const emoji = { "Hero Item": "🌟", "Volume Driver": "📈", "Hidden Gem": "💎", "Underperformer": "⚠️" };
        console.log(`  ${emoji[doc.classification]} ${doc.name.padEnd(25)} | ${doc.classification.padEnd(15)} | Tier ${doc.profitabilityTier} | Velocity ${doc.salesVelocity}/day | Margin ${doc.marginPct}%`);
    }

    console.log(`\n✅ Seeded ${analytics.length} items`);
    console.log(`   Avg Margin: ₹${avgMargin.toFixed(0)} | Avg Popularity: ${avgPop.toFixed(0)}`);
    console.log(`   Hero Items: ${analytics.filter(a => a.classification === "Hero Item").length}`);
    console.log(`   Volume Drivers: ${analytics.filter(a => a.classification === "Volume Driver").length}`);
    console.log(`   Hidden Gems: ${analytics.filter(a => a.classification === "Hidden Gem").length}`);
    console.log(`   Underperformers: ${analytics.filter(a => a.classification === "Underperformer").length}`);

    await mongoose.disconnect();
    console.log("\n🔌 Disconnected");
}

seed().catch(err => { console.error("❌ Error:", err); process.exit(1); });
