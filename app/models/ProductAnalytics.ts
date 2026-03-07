import mongoose, { Schema, Document } from "mongoose";

export interface IPriceHistoryEntry {
    price: number;
    startDate: Date;
    endDate: Date | null;
    daysActive: number;
    ordersAtPrice: number;
    qtySoldAtPrice: number;
    revenueAtPrice: number;
    avgDailyDemand: number;
}

export interface IDailyHistory {
    date: string;
    orders: number;
    qty: number;
    revenue: number;
}

export interface IProductAnalytics extends Document {
    foodId: string;
    name: string;
    category: string;

    // Financials
    currentPrice: number;
    cost: number;
    margin: number;
    marginPct: number;

    // Price History
    priceHistory: IPriceHistoryEntry[];

    // Profit Optimization
    priceElasticity: number | null;
    optimalPrice: number | null;
    projectedProfitAtOptimal: number | null;
    currentMonthlyProfit: number;
    profitUplift: string | null;

    // Sales (30 days)
    totalOrders30d: number;
    totalRevenue30d: number;
    totalQtySold30d: number;
    avgDailyOrders: number;

    // Velocity & Popularity
    salesVelocity: number;
    popularityScore: number;
    velocityTrend: "rising" | "stable" | "declining";

    // Daily History
    dailyHistory: IDailyHistory[];

    // Classification
    classification: "Hero Item" | "Volume Driver" | "Hidden Gem" | "Underperformer";
    profitabilityTier: "A" | "B" | "C" | "D";

    // Inventory (future)
    estimatedDaysOfStock: number | null;
    restockAlert: boolean;

    // Metadata
    lastComputedAt: Date;
    computeVersion: number;
}

const ProductAnalyticsSchema = new Schema<IProductAnalytics>({
    foodId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String },

    currentPrice: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    marginPct: { type: Number, default: 0 },

    priceHistory: [{
        price: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date, default: null },
        daysActive: { type: Number, default: 0 },
        ordersAtPrice: { type: Number, default: 0 },
        qtySoldAtPrice: { type: Number, default: 0 },
        revenueAtPrice: { type: Number, default: 0 },
        avgDailyDemand: { type: Number, default: 0 }
    }],

    priceElasticity: { type: Number, default: null },
    optimalPrice: { type: Number, default: null },
    projectedProfitAtOptimal: { type: Number, default: null },
    currentMonthlyProfit: { type: Number, default: 0 },
    profitUplift: { type: String, default: null },

    totalOrders30d: { type: Number, default: 0 },
    totalRevenue30d: { type: Number, default: 0 },
    totalQtySold30d: { type: Number, default: 0 },
    avgDailyOrders: { type: Number, default: 0 },

    salesVelocity: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    velocityTrend: { type: String, enum: ["rising", "stable", "declining"], default: "stable" },

    dailyHistory: [{
        date: { type: String },
        orders: { type: Number, default: 0 },
        qty: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    }],

    classification: {
        type: String,
        enum: ["Hero Item", "Volume Driver", "Hidden Gem", "Underperformer"],
        default: "Underperformer",
        index: true
    },
    profitabilityTier: { type: String, enum: ["A", "B", "C", "D"], default: "D" },

    estimatedDaysOfStock: { type: Number, default: null },
    restockAlert: { type: Boolean, default: false },

    lastComputedAt: { type: Date, default: Date.now },
    computeVersion: { type: Number, default: 1 }
}, { timestamps: true });

// Compound indexes for fast queries
ProductAnalyticsSchema.index({ classification: 1, popularityScore: -1 });
ProductAnalyticsSchema.index({ marginPct: -1 });

const ProductAnalytics = mongoose.models.ProductAnalytics ||
    mongoose.model<IProductAnalytics>("ProductAnalytics", ProductAnalyticsSchema);
export default ProductAnalytics;
