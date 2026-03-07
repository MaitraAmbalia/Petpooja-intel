import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductAnalytics from "@/models/ProductAnalytics";

/**
 * GET /api/analytics/menu
 * Returns pre-computed ProductAnalytics data (fast, no aggregation)
 */
export async function GET() {
    try {
        await connectDB();

        const analytics = await ProductAnalytics.find()
            .sort({ popularityScore: -1 })
            .lean();

        return NextResponse.json({ success: true, data: analytics });
    } catch (error: any) {
        console.error("GET /api/analytics/menu Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
