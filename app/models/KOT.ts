import mongoose, { Schema, Document } from "mongoose";

export interface IKOTItem {
    foodId: string;
    name: string;
    qty: number;
    status: "pending" | "preparing" | "ready";
    updatedAt?: Date;
}

export interface IKOT extends Document {
    kotId: string;
    orderId: string;
    station: "Grill" | "Drinks" | "Dessert";
    items: IKOTItem[];
    status: "pending" | "in_progress" | "completed";
    priority: "normal" | "rush";
    orderType: "delivery" | "pickup" | "dine-in";
    customerName?: string;
    phoneNo?: string;
    defaultPrepTime: number;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const KOTSchema = new Schema<IKOT>({
    kotId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, index: true },
    station: {
        type: String,
        enum: ["Grill", "Drinks", "Dessert"],
        required: true,
        index: true
    },
    items: [{
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        status: {
            type: String,
            enum: ["pending", "preparing", "ready"],
            default: "pending"
        },
        updatedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
        default: "pending",
        index: true
    },
    priority: {
        type: String,
        enum: ["normal", "rush"],
        default: "normal"
    },
    orderType: {
        type: String,
        enum: ["delivery", "pickup", "dine-in"],
        default: "pickup"
    },
    customerName: { type: String },
    phoneNo: { type: String },
    defaultPrepTime: { type: Number, required: true, default: 8 },
    completedAt: { type: Date }
}, {
    timestamps: true
});

// Compound index for efficient kitchen screen queries
KOTSchema.index({ station: 1, status: 1, createdAt: -1 });

const KOT = mongoose.models.KOT || mongoose.model<IKOT>("KOT", KOTSchema);
export default KOT;
