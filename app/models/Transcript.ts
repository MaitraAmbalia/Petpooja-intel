import mongoose, { Schema, Document } from "mongoose";

export interface ITranscript extends Document {
    transcriptId: string;
    phoneNo: string;
    orderId?: string; // Optional if no order was actually placed
    timestamp: Date;
    messages: {
        role: "system" | "user" | "ai" | "tool" | "human";
        content: string;
    }[];
}

const TranscriptSchema = new Schema<ITranscript>({
    transcriptId: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    orderId: { type: String },
    timestamp: { type: Date, default: Date.now },
    messages: [{
        speaker: { type: String, enum: ["user", "agent", "system", "tool", "human"], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export const getTranscriptModel = (connection: mongoose.Connection): mongoose.Model<ITranscript> => {
    return connection.models.Transcript || connection.model<ITranscript>("Transcript", TranscriptSchema, "Transcript");
};
