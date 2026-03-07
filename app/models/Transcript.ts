import mongoose, { Schema, Document } from "mongoose";

export interface ITranscript extends Document {
    transcriptId: string;
    phoneNo: string;
    orderId?: string; // Optional if no order was actually placed
    timestamp: Date;
    messages: {
        role: "user" | "ai";
        text: string;
    }[];
}

const TranscriptSchema = new Schema<ITranscript>({
    transcriptId: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    orderId: { type: String },
    timestamp: { type: Date, default: Date.now },
    messages: [{
        role: { type: String, enum: ["user", "ai"], required: true },
        text: { type: String, required: true }
    }]
}, { timestamps: true });

const Transcript = mongoose.models.Transcript || mongoose.model<ITranscript>("Transcript", TranscriptSchema);
export default Transcript;
