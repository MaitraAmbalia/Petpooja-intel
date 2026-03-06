import mongoose, { Schema, Document } from "mongoose";

export interface IVoiceOrder extends Document {
    id: string; // E.g. VO_1001
    time: string;
    customer: string;
    phoneNumber: string;
    transactionId: string;
    invoiceNo: string;
    transcript: string;
    structuredJson: {
        items: {
            name: string;
            qty: number;
            price: number;
            variant?: string;
            addons?: string[];
        }[];
        total: number;
    };
    status: string;
    kotStatus: string;
    aiUpsell: string;
    callType: string;
}

const VoiceOrderSchema = new Schema<IVoiceOrder>({
    id: { type: String, required: true, unique: true },
    time: { type: String },
    customer: { type: String },
    phoneNumber: { type: String },
    transactionId: { type: String },
    invoiceNo: { type: String },
    transcript: { type: String },
    structuredJson: {
        items: [{
            name: { type: String },
            qty: { type: Number },
            price: { type: Number },
            variant: { type: String },
            addons: { type: [String] }
        }],
        total: { type: Number }
    },
    status: { type: String },
    kotStatus: { type: String },
    aiUpsell: { type: String },
    callType: { type: String }
}, { timestamps: true });

const VoiceOrder = mongoose.models.VoiceOrder || mongoose.model<IVoiceOrder>("VoiceOrder", VoiceOrderSchema);
export default VoiceOrder;
