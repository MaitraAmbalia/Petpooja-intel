// @ts-check
const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://dhruvlakhani0904_db_user:BJAYG5kYwYkwJdYP@cluster0.ucyzqis.mongodb.net/?appName=Cluster0";

const foodItems = [
    {
        foodId: "FI_101",
        name: "Classic Burger",
        description: "Juicy chicken patty with fresh lettuce and tomatoes.",
        price: 150,
        cost: 80,
        margin: 46,
        category: "Burgers",
        isVeg: false,
        ingredients: [{ name: "Chicken Patty", quantity: "1", unit: "pc" }],
        addons: [{ name: "Extra Cheese", price: 20 }]
    },
    {
        foodId: "FI_102",
        name: "Spicy Paneer Tikka",
        description: "Cottage cheese marinated in spicy yogurt.",
        price: 250,
        cost: 120,
        margin: 52,
        category: "Starters",
        isVeg: true,
        ingredients: [{ name: "Paneer", quantity: "200", unit: "g" }],
        addons: [{ name: "Extra Chutney", price: 10 }]
    },
    {
        foodId: "FI_103",
        name: "Medium Coke",
        description: "Chilled Coca-Cola",
        price: 60,
        cost: 20,
        margin: 66,
        category: "Beverages",
        isVeg: true,
        ingredients: [],
        addons: []
    },
    {
        foodId: "FI_104",
        name: "French Fries",
        description: "Crispy salted potato fries.",
        price: 90,
        cost: 30,
        margin: 66,
        category: "Sides",
        isVeg: true,
        ingredients: [{ name: "Potato", quantity: "150", unit: "g" }],
        addons: [{ name: "Peri Peri Masala", price: 15 }]
    }
];

const combos = [
    {
        comboId: "CMB_001",
        name: "Classic Burger Combo",
        description: "Includes 1 Classic Burger, Medium Fries, and a Coke.",
        items: [
            { foodId: "FI_101", qty: 1, defaultPrice: 150 },
            { foodId: "FI_104", qty: 1, defaultPrice: 90 },
            { foodId: "FI_103", qty: 1, defaultPrice: 60 }
        ],
        totalPrice: 250, // 50 off the normal 300 price
        triggerCategory: "Burgers",
        isActive: true
    }
];

async function seedDatabase() {
    console.log("Connecting to NEW database to seed mock data...");
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

        console.log("Mock data seeded successfully!");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
}

seedDatabase();
