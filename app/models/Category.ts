import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    categoryId: string;
    name: string;
    icon: string;
}

const CategorySchema = new Schema<ICategory>({
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
