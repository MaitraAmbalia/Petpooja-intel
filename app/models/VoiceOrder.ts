import mongoose, { Schema, Document } from "mongoose";

export interface IVoiceOrder extends Document {
    orderId: string;
    phoneNo: string;
    customerName?: string;
    orderType: string; // "delivery", "pickup", "dine-in"
    address?: string;
    time: string;
    status: string; // default "pending", then "complete"
    kotStatus: string; // default "pending"
    items: {
        foodId: string;
        name: string;
        qty: number;
        price: number;
        addons?: string[];
    }[];
    totalPrice: number;
    callSuccessful: boolean;
    upsellSuccessful: boolean;
}

const VoiceOrderSchema = new Schema<IVoiceOrder>({
    orderId: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    customerName: { type: String },
    orderType: { type: String, default: "pickup" },
    address: { type: String },
    time: { type: String },
    status: { type: String, default: "pending" },
    kotStatus: { type: String, default: "pending" },
    items: [{
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        addons: { type: [String] }
    }],
    totalPrice: { type: Number, required: true },
    callSuccessful: { type: Boolean, default: false },
    upsellSuccessful: { type: Boolean, default: false }
}, { timestamps: true });

export const getVoiceOrderModel = (connection: mongoose.Connection): mongoose.Model<IVoiceOrder> => {
    return connection.models.VoiceOrder || connection.model<IVoiceOrder>("VoiceOrder", VoiceOrderSchema, "VoiceOrder");
};
