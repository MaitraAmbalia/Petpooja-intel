import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Transcript from "../../models/Transcript";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const orderId = url.searchParams.get("orderId");
        const phoneNo = url.searchParams.get("phoneNo");

        const query: any = {};
        if (orderId) query.orderId = orderId;
        if (phoneNo) query.phoneNo = phoneNo;

        const transcripts = await Transcript.find(query).sort({ timestamp: -1 }).lean();
        return NextResponse.json({ success: true, count: transcripts.length, data: transcripts });
    } catch (error: any) {
        console.error("GET /api/transcripts Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
