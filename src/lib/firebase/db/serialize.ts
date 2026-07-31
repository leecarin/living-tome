// src/lib/firebase/db/serialize.ts

import type { Chapter, ChapterDocument } from "./schema";

/**
 * A Chapter with Firestore Timestamp fields converted to ISO date strings,
 * safe to return from `getServerSideProps` / `getStaticProps` and to store
 * in React/SWR state.
 */
export interface SerializedChapter
    extends Omit<Chapter, "created_at" | "updated_at"> {
    created_at: string | null;
    updated_at: string | null;
}

function timestampToIso(
    value: ChapterDocument["created_at"] | ChapterDocument["updated_at"],
): string | null {
    // Firestore Timestamp instances expose `.toDate()`. A doc that was just
    // written client-side (before round-tripping through the server) may
    // still hold the `serverTimestamp()` sentinel instead, which has no
    // `.toDate()` — treat that as "not yet known" rather than throwing.
    if (
        value &&
        typeof value === "object" &&
        "toDate" in value &&
        typeof value.toDate === "function"
    ) {
        return value.toDate().toISOString();
    }
    return null;
}

/**
 * Converts a Chapter (as returned by the firestore.ts read functions) into a
 * plain-JSON-serializable shape.
 */
export function serializeChapter(chapter: Chapter): SerializedChapter {
    return {
        ...chapter,
        created_at: timestampToIso(chapter.created_at),
        updated_at: timestampToIso(chapter.updated_at),
    };
}