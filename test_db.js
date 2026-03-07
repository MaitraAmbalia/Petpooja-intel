const mongoose = require('mongoose');
const fs = require('fs');

const uri = "mongodb+srv://dhruvlakhani0904_db_user:BJAYG5kYwYkwJdYP@cluster0.ucyzqis.mongodb.net/petpooja_db?appName=Cluster0";

async function verify() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.useDb('petpooja_db');

        let output = "";
        const voiceOrderColl = db.collection('VoiceOrder');
        const vo = await voiceOrderColl.findOne({});
        output += "--- VOICE ORDER STRUCTURE ---\n";
        output += JSON.stringify(vo, null, 2) + "\n\n";

        const transcriptColl = db.collection('Transcript');
        const tr = await transcriptColl.findOne({});
        output += "--- TRANSCRIPT STRUCTURE ---\n";
        output += JSON.stringify(tr, null, 2) + "\n";

        fs.writeFileSync('db_out_clean.txt', output, 'utf8');
        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

verify();
