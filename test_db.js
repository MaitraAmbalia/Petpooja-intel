const mongoose = require('mongoose');

async function clean() {
    const mainMongoose = await mongoose.connect('mongodb+srv://dhruvlakhani0904_db_user:BJAYG5kYwYkwJdYP@cluster0.ucyzqis.mongodb.net/?appName=Cluster0');

    // Mark all KOTs older than 1 hour as completed
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await mainMongoose.connection.db.collection('kots').updateMany(
        { createdAt: { $lt: oneHourAgo } },
        {
            $set: {
                status: 'completed',
                'items.$[elem].status': 'ready',
                completedAt: new Date()
            }
        },
        {
            arrayFilters: [{ "elem.status": { $ne: "ready" } }]
        }
    );

    console.log(`Marked ${result.modifiedCount} old KOTs as completed.`);
    process.exit(0);
}

clean().catch(console.error);
