const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://dhruvlakhani0904_db_user:BJAYG5kYwYkwJdYP@cluster0.ucyzqis.mongodb.net/?appName=Cluster0";

async function run() {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: "test" });
        const db = mongoose.connection.db;

        // Clear
        await db.collection("kots").deleteMany({});
        await db.collection("voiceorders").deleteMany({});
        await db.collection("transcripts").deleteMany({});
        console.log("Cleared.");

        // VoiceOrders
        const orders = [
            {
                orderId: "VO_001", phoneNo: "+91-9876543210", customerName: "Rahul Sharma",
                orderType: "pickup", time: "12:30 PM", status: "pending", kotStatus: "in_kitchen",
                items: [
                    { foodId: "FI_MCD_03", name: "Maharaja Mac (Veg)", qty: 1, price: 210 },
                    { foodId: "FI_MCD_05", name: "French Fries (L)", qty: 1, price: 110 },
                    { foodId: "FI_MCD_09", name: "Coke (M)", qty: 1, price: 90 }
                ],
                totalPrice: 410, callSuccessful: true, upsellSuccessful: true,
                createdAt: new Date(Date.now() - 4 * 60000)
            },
            {
                orderId: "VO_002", phoneNo: "+91-9123456789", customerName: "Priya Patel",
                orderType: "delivery", address: "42 Marine Drive, Mumbai", time: "12:35 PM",
                status: "pending", kotStatus: "in_kitchen",
                items: [
                    { foodId: "FI_MCD_01", name: "McVeggie Burger", qty: 2, price: 120 },
                    { foodId: "FI_MCD_06", name: "McNuggets (6pc)", qty: 1, price: 170 },
                    { foodId: "FI_MCD_21", name: "Chocolate Shake", qty: 2, price: 140 },
                    { foodId: "FI_MCD_12", name: "McFlurry Oreo", qty: 1, price: 115 }
                ],
                totalPrice: 705, callSuccessful: true, upsellSuccessful: false,
                createdAt: new Date(Date.now() - 7 * 60000)
            },
            {
                orderId: "VO_003", phoneNo: "+91-8888777766", customerName: "Amit Desai",
                orderType: "dine-in", time: "12:20 PM", status: "pending", kotStatus: "in_kitchen",
                items: [
                    { foodId: "FI_MCD_19", name: "Wrap (Grilled Chicken)", qty: 1, price: 210 },
                    { foodId: "FI_MCD_10", name: "Cold Coffee", qty: 1, price: 130 },
                    { foodId: "FI_MCD_20", name: "Hot Fudge Sundae", qty: 1, price: 105 }
                ],
                totalPrice: 445, callSuccessful: true, upsellSuccessful: true,
                createdAt: new Date(Date.now() - 12 * 60000)
            },
            {
                orderId: "VO_004", phoneNo: "+91-7777888899", customerName: "Sneha Joshi",
                orderType: "pickup", time: "12:42 PM", status: "pending", kotStatus: "in_kitchen",
                items: [
                    { foodId: "FI_MCD_02", name: "McChicken", qty: 1, price: 135 },
                    { foodId: "FI_MCD_08", name: "McAloo Tikki", qty: 2, price: 70 },
                    { foodId: "FI_MCD_22", name: "Iced Tea", qty: 1, price: 70 },
                    { foodId: "FI_MCD_11", name: "Soft Serve (Cone)", qty: 2, price: 35 }
                ],
                totalPrice: 415, callSuccessful: true, upsellSuccessful: true,
                createdAt: new Date(Date.now() - 1 * 60000)
            },
            {
                orderId: "VO_005", phoneNo: "+91-6666555544", customerName: "Vikram Singh",
                orderType: "delivery", address: "15 Bandra West, Mumbai", time: "12:45 PM",
                status: "pending", kotStatus: "in_kitchen",
                items: [
                    { foodId: "FI_MCD_04", name: "Maharaja Mac (Chicken)", qty: 2, price: 235 },
                    { foodId: "FI_MCD_05", name: "French Fries (L)", qty: 2, price: 110 },
                    { foodId: "FI_MCD_09", name: "Coke (M)", qty: 2, price: 90 },
                    { foodId: "FI_MCD_23", name: "Caramel Sundae", qty: 2, price: 120 },
                    { foodId: "FI_MCD_24", name: "Apple Pie", qty: 1, price: 90 }
                ],
                totalPrice: 1245, callSuccessful: true, upsellSuccessful: true,
                createdAt: new Date(Date.now() - 2 * 60000)
            }
        ];
        await db.collection("voiceorders").insertMany(orders);
        console.log("VoiceOrders: " + orders.length);

        // Transcripts
        const transcripts = [
            {
                transcriptId: "TR_001", phoneNo: "+91-9876543210", orderId: "VO_001", timestamp: new Date(), messages: [
                    { role: "ai", text: "Welcome to McDonald's! How can I help you today?" },
                    { role: "user", text: "Hi, I'd like a Maharaja Mac Veg meal please." },
                    { role: "ai", text: "Great choice! That comes with French Fries and a Coke. Would you like to add a McFlurry for just Rs 115?" },
                    { role: "user", text: "No thanks, just the meal please." },
                    { role: "ai", text: "Perfect! Your Maharaja Mac Veg Meal is Rs 410. Pickup order confirmed!" }
                ]
            },
            {
                transcriptId: "TR_002", phoneNo: "+91-9123456789", orderId: "VO_002", timestamp: new Date(), messages: [
                    { role: "ai", text: "Hello! Welcome to McDonald's. What would you like?" },
                    { role: "user", text: "I need 2 McVeggie Burgers, McNuggets, and 2 Chocolate Shakes." },
                    { role: "ai", text: "Sure! Can I tempt you with a McFlurry Oreo?" },
                    { role: "user", text: "Yes, add one. Delivery to Marine Drive." },
                    { role: "ai", text: "Your total is Rs 705. Delivery confirmed!" }
                ]
            },
            {
                transcriptId: "TR_003", phoneNo: "+91-8888777766", orderId: "VO_003", timestamp: new Date(), messages: [
                    { role: "ai", text: "Hi! What can I get for you?" },
                    { role: "user", text: "One Grilled Chicken Wrap, Cold Coffee, and Hot Fudge Sundae." },
                    { role: "ai", text: "Excellent! Dine-in order for Rs 445. Coming right up!" }
                ]
            },
            {
                transcriptId: "TR_004", phoneNo: "+91-7777888899", orderId: "VO_004", timestamp: new Date(), messages: [
                    { role: "ai", text: "Welcome! How can I help?" },
                    { role: "user", text: "McChicken, two McAloo Tikki, Iced Tea, and two Soft Serve cones." },
                    { role: "ai", text: "Perfect! Rs 415 pickup order confirmed. Ready in 8 minutes!" }
                ]
            },
            {
                transcriptId: "TR_005", phoneNo: "+91-6666555544", orderId: "VO_005", timestamp: new Date(), messages: [
                    { role: "ai", text: "Hello! What would you like to order?" },
                    { role: "user", text: "Big order! 2 Maharaja Mac Chicken, 2 large fries, 2 Cokes, 2 Caramel Sundaes and an Apple Pie." },
                    { role: "ai", text: "Wow, that is a feast! Rs 1245, rush priority, delivery to Bandra West. 20 minutes!" }
                ]
            }
        ];
        await db.collection("transcripts").insertMany(transcripts);
        console.log("Transcripts: " + transcripts.length);

        // KOTs
        const CAT_MAP = { FI_MCD_01: "Snack", FI_MCD_02: "Snack", FI_MCD_03: "Snack", FI_MCD_04: "Snack", FI_MCD_05: "Snack", FI_MCD_06: "Snack", FI_MCD_07: "Snack", FI_MCD_08: "Snack", FI_MCD_09: "Beverage", FI_MCD_10: "Beverage", FI_MCD_11: "Dessert", FI_MCD_12: "Dessert", FI_MCD_13: "Snack", FI_MCD_14: "Snack", FI_MCD_15: "Snack", FI_MCD_16: "Snack", FI_MCD_17: "Snack", FI_MCD_18: "Snack", FI_MCD_19: "Snack", FI_MCD_20: "Dessert", FI_MCD_21: "Beverage", FI_MCD_22: "Beverage", FI_MCD_23: "Dessert", FI_MCD_24: "Dessert", FI_MCD_25: "Beverage" };
        const ST_MAP = { Snack: { s: "Grill", t: 8 }, Beverage: { s: "Drinks", t: 3 }, Dessert: { s: "Dessert", t: 5 } };

        const kots = [];
        let c = 1;
        for (const o of orders) {
            const groups = {};
            for (const item of o.items) {
                const cat = CAT_MAP[item.foodId] || "Snack";
                const m = ST_MAP[cat];
                if (!groups[m.s]) groups[m.s] = { items: [], t: m.t };
                groups[m.s].items.push({ foodId: item.foodId, name: item.name, qty: item.qty, status: "pending", updatedAt: new Date() });
                if (m.t > groups[m.s].t) groups[m.s].t = m.t;
            }
            for (const [station, g] of Object.entries(groups)) {
                kots.push({
                    kotId: "KOT_" + String(c++).padStart(3, "0"),
                    orderId: o.orderId, station, items: g.items, status: "pending",
                    priority: o.items.length > 4 ? "rush" : "normal",
                    orderType: o.orderType, customerName: o.customerName, phoneNo: o.phoneNo,
                    defaultPrepTime: g.t, createdAt: o.createdAt, updatedAt: o.createdAt
                });
            }
        }
        await db.collection("kots").insertMany(kots);
        console.log("KOTs: " + kots.length);
        console.log("Done!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}
run();
