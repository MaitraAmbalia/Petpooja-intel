const { MongoClient } = require("mongodb");

const OLD_URI = "mongodb+srv://user_07:rR9FTFvZLdKcFYkL@cluster0.3dljqg2.mongodb.net/?appName=Cluster0";

async function scanOldCluster() {
    console.log("Scanning entire OLD database cluster...");
    const client = new MongoClient(OLD_URI);

    try {
        await client.connect();

        // List all databases
        const dbs = await client.db().admin().listDatabases();
        console.log("Databases found:");

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            console.log(`\n\n--- Database: ${dbName} ---`);

            if (dbName === "admin" || dbName === "local") continue; // Skip internal MongoDB dbs

            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();

            if (collections.length === 0) {
                console.log("  (Empty - No collections)");
                continue;
            }

            for (const coll of collections) {
                console.log(`  Collection: ${coll.name}`);
                const sampleData = await db.collection(coll.name).find({}).limit(1).toArray();
                if (sampleData.length > 0) {
                    console.log(`    Sample Doc: ${JSON.stringify(sampleData[0]).substring(0, 100)}...`);
                } else {
                    console.log("    (Empty)");
                }
            }
        }

    } catch (error) {
        console.error("Scan error:", error);
    } finally {
        await client.close();
    }
}

scanOldCluster();
