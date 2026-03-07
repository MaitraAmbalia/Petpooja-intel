import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import FoodItem from "../../models/FoodItem";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const url = new URL(req.url);
        const category = url.searchParams.get("category");

        let query = {};
        if (category && category !== "all") {
            query = { category };
        }

        const items = await FoodItem.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: items.length, data: items }, { status: 200 });
    } catch (error: any) {
        console.error("GET /api/menu Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        if (!body.name || body.price === undefined) {
            return NextResponse.json({ success: false, error: "Please provide essential item details" }, { status: 400 });
        }

        // Ensure foodId exists
        if (!body.foodId) {
            body.foodId = `sku_${Date.now()}`;
        }

        // Calculate margin = price - cost
        const cost = body.cost || 0;
        const price = body.price || 0;

        const newPayload = {
            ...body,
            category: body.category || "Uncategorized",
            cost,
            margin: price - cost,
            isVeg: typeof body.isVeg === 'boolean' ? body.isVeg : true,
            dietType: body.dietType || "veg"
        };

        const newItem = await FoodItem.create(newPayload);

        return NextResponse.json({ success: true, data: newItem }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/menu Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { foodId, ...updateData } = body;

        if (!foodId) {
            return NextResponse.json({ success: false, error: "foodId is required to update an item." }, { status: 400 });
        }

        // Recalculate margin when price or cost changes
        if (updateData.price !== undefined || updateData.cost !== undefined) {
            const existing = await FoodItem.findOne({ foodId }).lean() as any;
            if (existing) {
                const p = updateData.price ?? existing.price ?? 0;
                const c = updateData.cost ?? existing.cost ?? 0;
                updateData.margin = p - c;
            }
        }

        const updatedItem = await FoodItem.findOneAndUpdate(
            { foodId: foodId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
    } catch (error: any) {
        console.error("PUT /api/menu Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const url = new URL(req.url);
        const foodId = url.searchParams.get("foodId");

        if (!foodId) {
            return NextResponse.json({ success: false, error: "foodId is required" }, { status: 400 });
        }

        const deletedItem = await FoodItem.findOneAndDelete({ foodId });

        if (!deletedItem) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE /api/menu Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
