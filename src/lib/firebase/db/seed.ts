// src/lib/firebase/db/seed.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { seedExampleChapters } from "./schema";

async function run() {
    console.log(
        "Firebase Project ID:",
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    );
    console.log("Starting seed process...");
    try {
        const createdIds = await seedExampleChapters();
        console.log("Created Document IDs:", createdIds);
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed chapters:", error);
        process.exit(1);
    }
}

run();
