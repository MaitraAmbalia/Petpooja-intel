import mongoose from "mongoose";

const OLD_URI = "mongodb+srv://user_07:rR9FTFvZLdKcFYkL@cluster0.3dljqg2.mongodb.net/?appName=Cluster0";
const NEW_URI = "mongodb+srv://dhruvlakhani0904_db_user:BJAYG5kYwYkwJdYP@cluster0.ucyzqis.mongodb.net/?appName=Cluster0";

// Define the old database models. The old python ai uses "petpooja_db" by default.
// Let's connect and read raw collections without schemas first to see what's in there.

async function inspectOldDatabase() {
    console.log("Connecting to OLD database...");
    const oldConnection = mongoose.createConnection(OLD_URI);

    // Note: the default DB name is "petpooja_db" according to ai/database.py
    const petpoojaDb = oldConnection.useDb("petpooja_db");

    const foodItems = await petpoojaDb.collection("menu").find({}).toArray();
    console.log("\n--- Old Menu (fooditems) sample ---");
    console.log(JSON.stringify(foodItems.slice(0, 3), null, 2));

    const orders = await petpoojaDb.collection("orders").find({}).toArray();
    console.log("\n--- Old Orders sample ---");
    console.log(JSON.stringify(orders.slice(0, 3), null, 2));

    const combos = await petpoojaDb.collection("combos").find({}).toArray();
    console.log("\n--- Old Combos sample ---");
    console.log(JSON.stringify(combos.slice(0, 3), null, 2));

    await oldConnection.close();
    console.log("\nClosed connection.");
}

inspectOldDatabase().catch(console.error);
