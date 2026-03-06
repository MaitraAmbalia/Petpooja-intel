/**
 * Seed Script - Creates default Admin and Staff users
 * 
 * Run with: npx tsx scripts/seed.ts
 * 
 * Default Credentials:
 * - Admin: admin@petpooja.com / admin123
 * - Staff: staff@petpooja.com / staff123
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env file");
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    provider: { type: String, default: "credentials" },
    role: { type: String, enum: ["ADMIN", "STAFF", "RESTAURANT_OWNER"], default: "RESTAURANT_OWNER" },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const seedUsers = [
    {
        name: "Admin User",
        email: "admin@petpooja.com",
        password: "admin123",
        role: "ADMIN",
        provider: "credentials",
    },
    {
        name: "Staff Member",
        email: "staff@petpooja.com",
        password: "staff123",
        role: "STAFF",
        provider: "credentials",
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        for (const userData of seedUsers) {
            const exists = await User.findOne({ email: userData.email });
            if (exists) {
                console.log(`⏭️  User ${userData.email} already exists, skipping.`);
                continue;
            }

            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            await User.create({
                ...userData,
                password: hashedPassword,
            });

            console.log(`✅ Created ${userData.role}: ${userData.email}`);
        }

        console.log("\n🎉 Seeding complete!");
        console.log("📋 Default Credentials:");
        console.log("   Admin: admin@petpooja.com / admin123");
        console.log("   Staff: staff@petpooja.com / staff123");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
