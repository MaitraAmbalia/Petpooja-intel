import mongoose, { Schema, Document } from "mongoose";

export interface IFoodItem extends Document {
    foodId: string;
    foodName: string;
    price: number;
    category: string;
    foodCost: number;
    margin: number;
    opCost?: number;
    isVeg: boolean;
    dietType: string;
    spiceLevel: number;
    popularityScore?: number;
    orderHistory?: number[];
    ingredients: { name: string; quantity: string; unit: string }[];
    variants: { name: string; price: number }[];
    addons: { name: string; price: number }[];
}

const FoodItemSchema = new Schema<IFoodItem>({
    foodId: { type: String, required: true, unique: true },
    foodName: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    foodCost: { type: Number, required: true },
    margin: { type: Number, required: true },
    opCost: { type: Number },
    isVeg: { type: Boolean, required: true },
    dietType: { type: String, required: true },
    spiceLevel: { type: Number, default: 0 },
    popularityScore: { type: Number },
    orderHistory: { type: [Number] },
    ingredients: [{
        name: { type: String },
        quantity: { type: String },
        unit: { type: String }
    }],
    variants: [{
        name: { type: String },
        price: { type: Number }
    }],
    addons: [{
        name: { type: String },
        price: { type: Number }
    }]
}, { timestamps: true });

const FoodItem = mongoose.models.FoodItem || mongoose.model<IFoodItem>("FoodItem", FoodItemSchema);
export default FoodItem;
