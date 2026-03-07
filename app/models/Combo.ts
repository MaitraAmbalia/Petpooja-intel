import mongoose, { Schema, Document } from "mongoose";

export interface ICombo extends Document {
    comboId: string;
    name: string;
    description: string;
    items: {
        foodId: string;
        qty: number;
        defaultPrice: number;
    }[];
    totalPrice: number;
    triggerCategory?: string;
    popularityScore?: number;
    isActive: boolean;
}

const ComboSchema = new Schema<ICombo>({
    comboId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    items: [{
        foodId: { type: String, required: true },
        qty: { type: Number, default: 1 },
        defaultPrice: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    triggerCategory: { type: String },
    popularityScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Combo = mongoose.models.Combo || mongoose.model<ICombo>("Combo", ComboSchema);
export default Combo;
