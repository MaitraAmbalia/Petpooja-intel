const { MongoClient } = require("mongodb");

const OLD_URI = "mongodb+srv://user_07:rR9FTFvZLdKcFYkL@cluster0.3dljqg2.mongodb.net/?appName=Cluster0";

async function pullTestData() {
    console.log("Pulling test data...");
    const client = new MongoClient(OLD_URI, { serverSelectionTimeoutMS: 15000 });

    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected to MongoDB.");

        const testDb = client.db("test");

        console.log("--- Collection: fooditems ---");
        const fooditems = await testDb.collection("fooditems").find({}).limit(3).toArray();
        console.log("Items found:", fooditems.length);
        if (fooditems.length > 0) {
            console.log(JSON.stringify(fooditems, null, 2));
        }

        console.log("\n--- Collection: food_items ---");
        const food_items = await testDb.collection("food_items").find({}).limit(3).toArray();
        console.log("Items found:", food_items.length);
        if (food_items.length > 0) {
            console.log(JSON.stringify(food_items, null, 2));
        }

    } catch (error) {
        console.error("error:", error.message || error);
    } finally {
        console.log("Closing connection...");
        await client.close();
    }
}

pullTestData();
