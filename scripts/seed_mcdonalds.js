const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://dhruvlakhani0904_db_user:BJAYG5kYwYkwJdYP@cluster0.ucyzqis.mongodb.net/?appName=Cluster0";

const commonAddons = [
    { name: "Extra Cheese", price: 25 },
    { name: "Extra Tomato", price: 15 },
    { name: "Extra Lettuce", price: 15 },
    { name: "Extra Olives", price: 20 },
    { name: "Extra Onions", price: 10 }
];

const foodItems = [
    { foodId: "FI_MCD_01", name: "McVeggie Burger", price: 120, cost: 45, margin: 75, category: "Snack", isVeg: true, addons: commonAddons, popularityScore: 2016 },
    { foodId: "FI_MCD_02", name: "McChicken", price: 135, cost: 62, margin: 73, category: "Snack", isVeg: false, addons: commonAddons, popularityScore: 1890 },
    { foodId: "FI_MCD_03", name: "Maharaja Mac (Veg)", price: 210, cost: 95, margin: 115, category: "Snack", isVeg: true, addons: commonAddons, popularityScore: 420 },
    { foodId: "FI_MCD_04", name: "Maharaja Mac (Chicken)", price: 235, cost: 117, margin: 118, category: "Snack", isVeg: false, addons: commonAddons, popularityScore: 350 },
    { foodId: "FI_MCD_05", name: "French Fries (L)", price: 110, cost: 33, margin: 77, category: "Snack", isVeg: true, addons: [], popularityScore: 3220 },
    { foodId: "FI_MCD_06", name: "McNuggets (6pc)", price: 170, cost: 80, margin: 90, category: "Snack", isVeg: false, addons: [], popularityScore: 1680 },
    { foodId: "FI_MCD_07", name: "Pizza McPuff", price: 55, cost: 23, margin: 32, category: "Snack", isVeg: true, addons: [], popularityScore: 980 },
    { foodId: "FI_MCD_08", name: "McAloo Tikki", price: 70, cost: 30, margin: 40, category: "Snack", isVeg: true, addons: commonAddons, popularityScore: 2680 },
    { foodId: "FI_MCD_09", name: "Coke (M)", price: 90, cost: 10, margin: 80, category: "Beverage", isVeg: true, addons: [], popularityScore: 3500 },
    { foodId: "FI_MCD_10", name: "Cold Coffee", price: 130, cost: 45, margin: 85, category: "Beverage", isVeg: true, addons: [], popularityScore: 1450 },
    { foodId: "FI_MCD_11", name: "Soft Serve (Cone)", price: 35, cost: 13, margin: 22, category: "Dessert", isVeg: true, addons: [], popularityScore: 2517 },
    { foodId: "FI_MCD_12", name: "McFlurry Oreo", price: 115, cost: 50, margin: 65, category: "Dessert", isVeg: true, addons: [], popularityScore: 1820 },
    { foodId: "FI_MCD_13", name: "Filet-O-Fish", price: 165, cost: 100, margin: 65, category: "Snack", isVeg: false, addons: commonAddons, popularityScore: 620 },
    { foodId: "FI_MCD_14", name: "Chicken Wings (2pc)", price: 140, cost: 88, margin: 52, category: "Snack", isVeg: false, addons: [], popularityScore: 810 },
    { foodId: "FI_MCD_15", name: "Veg McMuffin", price: 100, cost: 42, margin: 58, category: "Snack", isVeg: true, addons: commonAddons, popularityScore: 540 },
    { foodId: "FI_MCD_16", name: "Egg McMuffin", price: 110, cost: 47, margin: 63, category: "Snack", isVeg: false, addons: commonAddons, popularityScore: 490 },
    { foodId: "FI_MCD_17", name: "Hashbrown", price: 50, cost: 22, margin: 28, category: "Snack", isVeg: true, addons: [], popularityScore: 1750 },
    { foodId: "FI_MCD_18", name: "Wrap (Grilled Veg)", price: 180, cost: 83, margin: 97, category: "Snack", isVeg: true, addons: commonAddons, popularityScore: 310 },
    { foodId: "FI_MCD_19", name: "Wrap (Grilled Chicken)", price: 210, cost: 105, margin: 105, category: "Snack", isVeg: false, addons: commonAddons, popularityScore: 280 },
    { foodId: "FI_MCD_20", name: "Hot Fudge Sundae", price: 105, cost: 40, margin: 65, category: "Dessert", isVeg: true, addons: [], popularityScore: 1560 },
    { foodId: "FI_MCD_21", name: "Chocolate Shake", price: 140, cost: 50, margin: 90, category: "Beverage", isVeg: true, addons: [], popularityScore: 2100 },
    { foodId: "FI_MCD_22", name: "Iced Tea", price: 70, cost: 25, margin: 45, category: "Beverage", isVeg: true, addons: [], popularityScore: 1320 },
    { foodId: "FI_MCD_23", name: "Caramel Sundae", price: 120, cost: 40, margin: 80, category: "Dessert", isVeg: true, addons: [], popularityScore: 1280 },
    { foodId: "FI_MCD_24", name: "Apple Pie", price: 90, cost: 40, margin: 50, category: "Dessert", isVeg: true, addons: [], popularityScore: 890 },
    { foodId: "FI_MCD_25", name: "Bottled Water", price: 40, cost: 15, margin: 25, category: "Beverage", isVeg: true, addons: [], popularityScore: 3100 },
];

// Weighted Average Popularity: each item's pop contributes by its price share
const calcComboPopularity = (comboItems) => {
    const totalPrice = comboItems.reduce((acc, ci) => acc + ci.defaultPrice, 0);
    if (totalPrice === 0) return 0;
    return Number(comboItems.reduce((acc, ci) => {
        const item = foodItems.find(f => f.foodId === ci.foodId);
        const itemPop = item?.popularityScore || 0;
        return acc + (itemPop * (ci.defaultPrice / totalPrice));
    }, 0).toFixed(2));
};

const combosRaw = [
    {
        comboId: "CMB_MCD_001",
        name: "Maharaja Mac Meal",
        description: "Includes 1 Maharaja Mac (Veg or Chicken), Medium Fries, and a Coke.",
        items: [
            { foodId: "FI_MCD_03", qty: 1, defaultPrice: 210 },
            { foodId: "FI_MCD_05", qty: 1, defaultPrice: 110 },
            { foodId: "FI_MCD_09", qty: 1, defaultPrice: 90 }
        ],
        totalPrice: 350,
        triggerCategory: "Snack",
        isActive: true
    },
    {
        comboId: "CMB_MCD_002",
        name: "McVeggie Happy Meal",
        description: "Includes 1 McVeggie Burger, Hashbrown, and Iced Tea.",
        items: [
            { foodId: "FI_MCD_01", qty: 1, defaultPrice: 120 },
            { foodId: "FI_MCD_17", qty: 1, defaultPrice: 50 },
            { foodId: "FI_MCD_22", qty: 1, defaultPrice: 70 }
        ],
        totalPrice: 200,
        triggerCategory: "Snack",
        isActive: true
    }
];

const combos = combosRaw.map(c => ({
    ...c,
    popularityScore: calcComboPopularity(c.items)
}));

async function seedDatabase() {
    console.log("Connecting to NEW database to seed McDonald's mock data...");
    try {
        await mongoose.connect(MONGODB_URI, { dbName: "test" });
        const db = mongoose.connection.db;

        console.log("Clearing existing data...");
        await db.collection("fooditems").deleteMany({});
        await db.collection("combos").deleteMany({});

        console.log("Inserting Food Items...");
        await db.collection("fooditems").insertMany(foodItems);

        console.log("Inserting Combos...");
        await db.collection("combos").insertMany(combos);

        console.log("McDonald's mock data seeded successfully!");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
}

seedDatabase();
