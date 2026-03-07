import mongoose, { Schema, Document } from "mongoose";

export interface IFoodItem extends Document {
    foodId: string;
    name: string;
    description?: string;
    price: number;
    cost?: number;
    margin?: number;
    category: string;
    popularityScore?: number;
    isVeg?: boolean;
    ingredients?: { name: string; quantity: string; unit: string }[];
    addons?: { name: string; price: number }[];
}

const FoodItemSchema = new Schema<IFoodItem>({
    foodId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    cost: { type: Number },
    margin: { type: Number },
    category: { type: String, required: true },
    popularityScore: { type: Number, default: 0 },
    isVeg: { type: Boolean, default: true },
    ingredients: [{
        name: { type: String },
        quantity: { type: String },
        unit: { type: String }
    }],
    addons: [{
        name: { type: String },
        price: { type: Number }
    }]
}, { timestamps: true });

const FoodItem = mongoose.models.FoodItem || mongoose.model<IFoodItem>("FoodItem", FoodItemSchema);
export default FoodItem;
