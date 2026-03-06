/**
 * SCHEMAS FOR AI VOICE COPILOT & REVENUE ENGINE
 * 
 * Note: These are reference schemas and variable names to be used by the 
 * AI models and the logic engines. "No mock data" means these structures 
 * should be treated as the source of truth for real data integration.
 */

// User Schema: Tracks customer information and their ordering history
export const UserSchema = {
    name: "String",
    phone: "String",
    address: "String",
    // Track of history: Array of previous orders/combos
    history: [
        {
            itemId: "String", // Can be Food ID or Combo ID
            quantity: "Number",
            orderId: "String" // Reference to the full order
        }
    ],
    lastFinalBill: "Number"
};

// Restaurant Schema: Basic outlet information
export const RestaurantSchema = {
    name: "String",
    address: "String"
};

// Food/Item Schema: Individual items on the menu
export const FoodItemSchema = {
    foodName: "String",
    foodId: "String",
    price: "Number",
    category: "String", // e.g., Mains, Sides, Drinks
    foodCost: "Number", // Crucial for Revenue Engine (Selling Price - Food Cost = Margin)
    margin: "Number", // Selling Price - Food Cost
    opCost: "Number", // Operating cost to prepare/serve this item
    isVeg: "Boolean",
    dietType: "String", // veg, non-veg, jain
    spiceLevel: "Number", // 1-5, for customization clarifications
    popularityScore: "Number", // Sales velocity or popularity frequency
    ingredients: [
        { name: "String", quantity: "String", unit: "String" }
    ],
    variants: [
        { name: "String", price: "Number" }
    ],
    addons: [
        { name: "String", price: "Number" }
    ]
};

// Combo Schema: Bundled items for increasing AOV
export const ComboSchema = {
    comboName: "String",
    comboId: "String",
    price: "Number",
    items: ["String"], // List of FoodIds included in this combo
    savingAmount: "Number", // How much the user saves compared to individual items
    margin: "Number" // Total margin calculated for the bundle
};

// Order and Final Bill Schema: Real-time order capture
export const OrderSchema = {
    orderId: "String",
    timePlaced: "ISODate",
    billType: "String", // e.g., Dine-in, Takeaway, Delivery
    // All items (object: name of food - quantity - price)
    items: [
        {
            name: "String",
            quantity: "Number",
            price: "Number",
            customizations: "String" // e.g., "extra cheese", "less spicy"
        }
    ],
    totalPrice: "Number",
    status: "String" // e.g., "Pending", "Preparing", "KOT Created", "Delivered"
};

// Tables Schema: For Dine-in management
export const TableSchema = {
    tableNo: "Number",
    timeSlotBooked: "String", // e.g., "19:00 - 20:30"
    status: "String" // e.g., "Available", "Occupied", "Reserved"
};

/**
 * REVENUE ENGINE COMPONENT SCHEMAS (Internal Logic)
 */

export const RevenueMetricsSchema = {
    contributionMargin: "Number", // Price - Cost
    salesVelocity: "Number", // Items sold per unit of time
    aovContribution: "Number", // How much this item contributes to Average Order Value
    upsellPotential: "Number" // Score 0-1 based on common pairings
};
