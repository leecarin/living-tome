// src/lib/firebase/db/schema.ts

import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "./firestore";

// TypeScript interface for db schema
export interface ChapterDocument {
    title: string;
    slug: string;
    chapter_order: number;
    passage: string;
    user_id: string;
    parent_chapter_id: string;
    is_original: boolean;
    is_hidden: boolean;
    created_at: ReturnType<typeof serverTimestamp> | Timestamp;
    updated_at: ReturnType<typeof serverTimestamp> | Timestamp;
}

/**
 * Seeds only Chapter 2 into the 'chapters' collection, linking back to the existing Chapter 1.
 */
export async function seedExampleChapters(): Promise<string[]> {
    const chaptersRef = collection(db, "chapters");

    // 1. Fetch the existing Chapter 1 document ID from Firestore
    let parentChapterId = "";
    const q = query(chaptersRef, where("slug", "==", "solitary-cloy-1"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        parentChapterId = querySnapshot.docs[0].id;
        console.log(`Found existing Chapter 1 ID: ${parentChapterId}`);
    } else {
        console.warn(
            "Could not find existing Chapter 1 document with slug 'solitary-cloy-1'. Setting parent_chapter_id to empty.",
        );
    }

    // 2. Prepare Chapter 2 Data
    const chapter2Data: ChapterDocument = {
        title: "The Village of Barovia (DM Customization)",
        slug: "solitary-cloy-1-custom",
        chapter_order: 1,
        passage:
            "Dense fog clings to the tall pines. As your party steps into the clearing, you spot a strange skeletal figure leaning against the gates...",
        user_id: "usr_abc12345", // Foreign key reference to users collection ID
        parent_chapter_id: parentChapterId, // Links to the manual Chapter 1 ID
        is_original: false,
        is_hidden: false,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
    };

    // 3. Insert Chapter 2
    const docRef = await addDoc(chaptersRef, chapter2Data);

    console.log(`Successfully seeded Chapter 2! Document ID: ${docRef.id}`);
    return [docRef.id];
}
