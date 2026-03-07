import { NextRequest, NextResponse } from "next/server";
import connectDB, { connectVoiceDB } from "../../lib/mongodb";
import { getVoiceOrderModel } from "../../models/VoiceOrder";
import { getTranscriptModel } from "../../models/Transcript";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const voiceDb = await connectVoiceDB();
        const VoiceOrder = getVoiceOrderModel(voiceDb);
        const Transcript = getTranscriptModel(voiceDb);
        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const limit = parseInt(url.searchParams.get("limit") || "50");

        const query: any = {};
        if (status && status !== "all") query.status = status;

        const orders = await VoiceOrder.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Fetch transcripts for all orders in one query
        // The Voice AI often leaves transcript.orderId as null, so we must match by phoneNo as fallback.
        const phoneNumbers = orders.map((o: any) => o.phoneNo).filter(Boolean);
        const orderIds = orders.map((o: any) => o.orderId).filter(Boolean);

        const transcripts = await Transcript.find({
            $or: [
                { orderId: { $in: orderIds } },
                { phoneNo: { $in: phoneNumbers } }
            ]
        }).lean();

        // Build a map prioritizing exact orderId match, then falling back to latest phoneNo match
        const transcriptMap: Record<string, any> = {};

        // First map by phoneNo (chronological sort would be better, but we take what we get)
        transcripts.forEach((t: any) => {
            if (t.phoneNo) transcriptMap[t.phoneNo] = t;
        });

        // Then overwrite with explicit orderId matches to guarantee accuracy
        transcripts.forEach((t: any) => {
            if (t.orderId) transcriptMap[t.orderId] = t;
        });

        // Fetch official food prices to recalculate totals
        // The Voice AI LLM makes arithmetic errors in its JSON payload
        const allFoodIds = [...new Set(orders.flatMap(o => o.items.map((i: any) => i.foodId)))];
        const foodItemsList = await require("../../models/FoodItem").default.find({ foodId: { $in: allFoodIds } }).lean() as any[];
        const foodPriceMap = new Map(foodItemsList.map(f => [f.foodId, f]));

        // Merge transcript messages and mathematically accurate totals into each order
        const ordersWithTranscripts = orders.map((order: any) => {
            let recalculatedTotal = 0;
            const updatedItems = order.items.map((item: any) => {
                const officialFood = foodPriceMap.get(item.foodId);
                const basePrice = officialFood ? officialFood.price : item.price || 0;

                // Addons are sometimes free or have their own prices
                let addonsTotal = 0;
                if (officialFood && officialFood.addons && Array.isArray(item.addons)) {
                    item.addons.forEach((addonName: string) => {
                        const officialAddon = officialFood.addons.find((a: any) => a.name === addonName);
                        if (officialAddon) {
                            addonsTotal += officialAddon.price;
                        }
                    });
                }

                const itemTotal = (basePrice + addonsTotal) * (item.qty || 1);
                recalculatedTotal += itemTotal;

                return {
                    ...item,
                    price: basePrice, // Overwrite AI with official price
                    originalAiPrice: item.price // Keep original for debugging
                };
            });

            return {
                ...order,
                items: updatedItems,
                totalPrice: recalculatedTotal,
                originalAiTotal: order.totalPrice, // Keep AI's attempt just in case
                // Try exact orderId match first, fallback to phoneNo match
                transcript: transcriptMap[order.orderId] || transcriptMap[order.phoneNo] || null,
            };
        });

        // Compute analytics from all orders (not just filtered)
        const allOrders = await VoiceOrder.find({}).lean();
        const analytics = {
            totalCalls: allOrders.length,
            successfulCalls: allOrders.filter((o: any) => o.callSuccessful).length,
            humanTransfers: allOrders.filter((o: any) => !o.callSuccessful && o.status === "complete").length,
            pendingCallbacks: allOrders.filter((o: any) => o.status === "pending").length,
        };

        return NextResponse.json({
            success: true,
            count: ordersWithTranscripts.length,
            data: ordersWithTranscripts,
            analytics,
        });
    } catch (error: any) {
        console.error("GET /api/orders Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
