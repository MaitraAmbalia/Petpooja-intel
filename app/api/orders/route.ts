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
        const orderIds = orders.map((o: any) => o.orderId).filter(Boolean);
        const transcripts = await Transcript.find({ orderId: { $in: orderIds } }).lean();
        const transcriptMap: Record<string, any> = {};
        transcripts.forEach((t: any) => {
            transcriptMap[t.orderId] = t;
        });

        // Merge transcript messages into each order
        const ordersWithTranscripts = orders.map((order: any) => ({
            ...order,
            transcript: transcriptMap[order.orderId] || null,
        }));

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
