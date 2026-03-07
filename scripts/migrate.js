const { MongoClient } = require("mongodb");

const OLD_URI = "mongodb+srv://user_07:rR9FTFvZLdKcFYkL@cluster0.3dljqg2.mongodb.net/?appName=Cluster0";

async function inspectOldDatabase() {
    console.log("Connecting to OLD database...");
    const client = new MongoClient(OLD_URI);

    try {
        await client.connect();
        // Connect to the specific database
        const petpoojaDb = client.db("test");

        const foodItems = await petpoojaDb.collection("menu").find({}).limit(3).toArray();
        console.log("\n--- Old Menu (fooditems) sample ---");
        console.log(JSON.stringify(foodItems, null, 2));

        const orders = await petpoojaDb.collection("orders").find({}).limit(3).toArray();
        console.log("\n--- Old Orders sample ---");
        console.log(JSON.stringify(orders, null, 2));

        const combos = await petpoojaDb.collection("combos").find({}).limit(3).toArray();
        console.log("\n--- Old Combos sample ---");
        console.log(JSON.stringify(combos, null, 2));

    } catch (error) {
        console.error("Migration test error:", error);
    } finally {
        await client.close();
        console.log("\nClosed connection.");
    }
}

inspectOldDatabase();
