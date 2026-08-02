// scripts/seed-chapters.ts
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const chapters = JSON.parse(
    readFileSync(new URL("./chapters-seed.json", import.meta.url), "utf-8"),
);

if (!chapters) {
    console.error("No chapters found in chapters-seed.json");
    process.exit(1);
}

const serviceAccount = JSON.parse(
    readFileSync(new URL("../service-account.json", import.meta.url), "utf-8"),
);

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

const BATCH_SIZE = 500;

async function seed() {
    for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
        const chunk = chapters.slice(i, i + BATCH_SIZE);
        const batch = db.batch();

        for (const chapter of chunk) {
            const ref = db.collection("chapters").doc(); // auto-ID
            batch.set(ref, {
                ...chapter,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await batch.commit();
        console.log(`Committed ${i + chunk.length}/${chapters.length}`);
    }
}

seed().catch(console.error);
