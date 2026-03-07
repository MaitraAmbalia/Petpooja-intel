const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://dhruvlakhani0904_db_user:BJAYG5kYwYkwJdYP@cluster0.ucyzqis.mongodb.net/?appName=Cluster0";

const now = new Date();
const _1hourAgo = new Date(now.getTime() - 1000 * 60 * 60);
const _2hoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 2);

const voiceOrders = [
    {
        orderId: "VO_A1B2C3D4",
        phoneNo: "+919876543210",
        customerName: "Rahul Sharma",
        orderType: "delivery",
        address: "123 Main St, Mumbai",
        time: _1hourAgo.toISOString(),
        status: "pending",
        kotStatus: "pending",
        items: [
            { foodId: "FI_MCD_01", name: "McVeggie Burger", qty: 2, price: 120, addons: ["Extra Cheese"] },
            { foodId: "FI_MCD_05", name: "French Fries (L)", qty: 1, price: 110, addons: [] }
        ],
        totalPrice: 350,
        callSuccessful: true,
        upsellSuccessful: false,
        createdAt: _1hourAgo,
        updatedAt: _1hourAgo
    },
    {
        orderId: "VO_E5F6G7H8",
        phoneNo: "+919988776655",
        customerName: "Priya Desai",
        orderType: "pickup",
        address: "",
        time: _2hoursAgo.toISOString(),
        status: "complete",
        kotStatus: "complete",
        items: [
            { foodId: "FI_MCD_03", name: "Maharaja Mac (Veg)", qty: 1, price: 210, addons: [] },
            { foodId: "FI_MCD_09", name: "Coke (M)", qty: 1, price: 90, addons: [] }
        ],
        totalPrice: 300,
        callSuccessful: true,
        upsellSuccessful: true,
        createdAt: _2hoursAgo,
        updatedAt: _2hoursAgo
    }
];

const transcripts = [
    {
        transcriptId: "TR_11223344",
        phoneNo: "+919876543210",
        orderId: "VO_A1B2C3D4",
        timestamp: _1hourAgo,
        messages: [
            { role: "ai", text: "Hello! I am from Petpooja. May I have your name to start?" },
            { role: "user", text: "Yeah, this is Rahul." },
            { role: "ai", text: "Hi Rahul. How can I help you today? You can choose from: placing an order, making a dining reservation, or cancelling an order." },
            { role: "user", text: "I'd like to place an order for delivery." },
            { role: "ai", text: "Great! Could you please tell me your delivery address?" },
            { role: "user", text: "123 Main St, Mumbai." },
            { role: "ai", text: "Got it. What would you like to order today?" },
            { role: "user", text: "Give me two McVeggie burgers with extra cheese and one large fries." },
            { role: "ai", text: "Alright, two McVeggie Burgers with extra cheese and a large French Fries. Would you like to make it a combo with a cold drink?" },
            { role: "user", text: "No, just that." },
            { role: "ai", text: "Your total is 350. Can I confirm this order for delivery?" },
            { role: "user", text: "Yes, confirm it." },
            { role: "ai", text: "Order placed successfully! Order ID is VO_A1B2C3D4. Thank you, goodbye!" }
        ],
        createdAt: _1hourAgo,
        updatedAt: _1hourAgo
    },
    {
        transcriptId: "TR_55667788",
        phoneNo: "+919988776655",
        orderId: "VO_E5F6G7H8",
        timestamp: _2hoursAgo,
        messages: [
            { role: "ai", text: "Hello! I am from Petpooja. May I have your name to start?" },
            { role: "user", text: "I am Priya." },
            { role: "ai", text: "Hi Priya. How can I help you today? You can choose from: placing an order, making a dining reservation, or cancelling an order." },
            { role: "user", text: "I want to place a pickup order." },
            { role: "ai", text: "Alright, what would you like to order for pickup?" },
            { role: "user", text: "One Maharaja Mac veg." },
            { role: "ai", text: "One Maharaja Mac (Veg). Since you mentioned a burger, would you like to add a Medium Coke to make it a Maharaja Mac Meal?" },
            { role: "user", text: "Sure, add the coke." },
            { role: "ai", text: "Great choice! One Maharaja Mac (Veg) and a Medium Coke. Your total is 300. Shall I confirm your pickup order?" },
            { role: "user", text: "Yes please." },
            { role: "ai", text: "Order placed successfully! Order ID is VO_E5F6G7H8. Thank you, goodbye!" }
        ],
        createdAt: _2hoursAgo,
        updatedAt: _2hoursAgo
    },
    {
        transcriptId: "TR_NO_ORDER",
        phoneNo: "+919999999999",
        orderId: "", // No order placed
        timestamp: now,
        messages: [
            { role: "ai", text: "Hello! I am from Petpooja. May I have your name to start?" },
            { role: "user", text: "Hey, do you guys serve pizza?" },
            { role: "ai", text: "We do not serve traditional pizza, but we have a Pizza McPuff on our snack menu. Would you like to order that?" },
            { role: "user", text: "Ah, no thanks. Just checking." },
            { role: "ai", text: "No problem. Let me know if you need anything else. Have a great day!" }
        ],
        createdAt: now,
        updatedAt: now
    }
];

async function seedDatabase() {
    console.log("Connecting to database to seed VoiceOrders and Transcripts...");
    try {
        await mongoose.connect(MONGODB_URI, { dbName: "test" });
        const db = mongoose.connection.db;

        console.log("Clearing existing orders and transcripts...");
        await db.collection("voiceorders").deleteMany({});
        await db.collection("transcripts").deleteMany({});

        console.log("Inserting Voice Orders...");
        await db.collection("voiceorders").insertMany(voiceOrders);

        console.log("Inserting Transcripts...");
        await db.collection("transcripts").insertMany(transcripts);

        console.log("VoiceOrders and Transcripts seeded successfully!");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
}

seedDatabase();
