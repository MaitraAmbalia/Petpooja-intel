import { NextRequest, NextResponse } from "next/server";
import connectDB, { connectVoiceDB } from "../../lib/mongodb";
import { getVoiceOrderModel } from "../../models/VoiceOrder";
import FoodItem from "../../models/FoodItem";
import KOT from "../../models/KOT";

// Category → Station mapping
const CATEGORY_STATION: Record<string, string> = {
    "Snack": "Grill", "Beverage": "Drinks", "Dessert": "Dessert", "Add-on": "Grill",
};
const STATION_PREP: Record<string, number> = { Grill: 8, Drinks: 3, Dessert: 5 };

// ─── Auto-generate KOTs from new VoiceOrders ────────────────────
async function syncKOTs() {
    // Find successful orders that don't have KOTs yet
    const voiceDb = await connectVoiceDB();
    const VoiceOrder = getVoiceOrderModel(voiceDb);
    const orders = await VoiceOrder.find({ callSuccessful: true }).lean() as any[];
    const existingOrderIds = new Set(
        (await KOT.distinct("orderId")).map((id: string) => id)
    );

    const newOrders = orders.filter(o => !existingOrderIds.has(o.orderId));
    if (newOrders.length === 0) return;

    // Lookup categories for all food items
    const allFoodIds = [...new Set(newOrders.flatMap(o => o.items.map((i: any) => i.foodId)))];
    const foodItems = await FoodItem.find({ foodId: { $in: allFoodIds } }).lean() as any[];
    const catMap = new Map(foodItems.map(f => [f.foodId, f.category]));

    const kotsToInsert: any[] = [];
    let counter = Date.now();

    for (const order of newOrders) {
        const groups: Record<string, any[]> = {};

        for (const item of order.items) {
            const cat = catMap.get(item.foodId) || "Snack";
            const station = CATEGORY_STATION[cat] || "Grill";
            if (!groups[station]) groups[station] = [];
            groups[station].push({
                foodId: item.foodId,
                name: item.name,
                qty: item.qty,
                status: "pending",
                updatedAt: new Date(),
            });
        }

        for (const [station, items] of Object.entries(groups)) {
            kotsToInsert.push({
                kotId: `KOT_${counter++}`,
                orderId: order.orderId,
                station,
                items,
                status: "pending",
                priority: order.items.length > 4 ? "rush" : "normal",
                orderType: order.orderType || "pickup",
                customerName: order.customerName || "Walk-in",
                phoneNo: order.phoneNo,
                defaultPrepTime: STATION_PREP[station] || 8,
                createdAt: order.createdAt,
            });
        }
    }

    if (kotsToInsert.length > 0) {
        await KOT.insertMany(kotsToInsert);
    }
}

// ─── GET: Fetch KOTs (auto-sync first) ──────────────────────────
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        await syncKOTs(); // Auto-generate KOTs for new orders

        const url = new URL(req.url);
        const station = url.searchParams.get("station");
        const status = url.searchParams.get("status");

        const query: any = {};
        if (station && station !== "all") query.station = station;
        if (status && status !== "all") query.status = status;

        const kots = await KOT.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, count: kots.length, data: kots });
    } catch (error: any) {
        console.error("GET /api/kot Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ─── PUT: Update per-item status ────────────────────────────────
export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { kotId, foodId, newStatus } = body;

        if (!kotId || !foodId || !newStatus) {
            return NextResponse.json({ success: false, error: "kotId, foodId, and newStatus are required" }, { status: 400 });
        }

        const valid = ["pending", "preparing", "ready"];
        if (!valid.includes(newStatus)) {
            return NextResponse.json({ success: false, error: `newStatus must be: ${valid.join(", ")}` }, { status: 400 });
        }

        const kot = await KOT.findOne({ kotId });
        if (!kot) return NextResponse.json({ success: false, error: "KOT not found" }, { status: 404 });

        // Update specific item
        const item = kot.items.find((i: any) => i.foodId === foodId);
        if (!item) return NextResponse.json({ success: false, error: "Item not found in KOT" }, { status: 404 });

        item.status = newStatus;
        item.updatedAt = new Date();

        // Derive KOT status from items
        const allReady = kot.items.every((i: any) => i.status === "ready");
        const anyActive = kot.items.some((i: any) => i.status === "preparing" || i.status === "ready");

        if (allReady) {
            kot.status = "completed";
            kot.completedAt = new Date();
        } else if (anyActive) {
            kot.status = "in_progress";
        }

        await kot.save();

        // If this KOT is completed, check if ALL KOTs for this order are done
        if (allReady) {
            const siblings = await KOT.find({ orderId: kot.orderId });
            const allDone = siblings.every((k: any) => k.status === "completed");
            if (allDone) {
                const voiceDb = await connectVoiceDB();
                const VoiceOrder = getVoiceOrderModel(voiceDb);
                await VoiceOrder.findOneAndUpdate(
                    { orderId: kot.orderId },
                    { kotStatus: "ready", status: "complete" }
                );
            }
        }

        return NextResponse.json({ success: true, data: kot });
    } catch (error: any) {
        console.error("PUT /api/kot Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
