// src/lib/firebase/db/schema.ts

import {
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";

/**
 * Represents either a Firestore Timestamp or a server timestamp placeholder.
 */
export type FirestoreTimestamp =
    | Timestamp
    | ReturnType<typeof serverTimestamp>;

/**
 * Firestore document stored in the `chapters` collection.
 */
export interface ChapterDocument {
    /** Display title shown in the Tome */
    title: string;

    /** URL-friendly identifier */
    slug: string;

    /** Ordering within the Tome */
    chapter_order: number;

    /** Full passage text */
    passage: string;

    /**
     * Owner of the chapter.
     * null = official Interactive Tome chapter
     */
    user_id: string | null;

    /**
     * Original chapter this overrides.
     *
     * null = brand-new custom chapter
     */
    parent_chapter_id: string | null;

    /**
     * True if this is an official read-only chapter.
     */
    is_original: boolean;

    /**
     * Hidden from the user's campaign.
     */
    is_hidden: boolean;

    created_at: FirestoreTimestamp;
    updated_at: FirestoreTimestamp;
}

/**
 * Firestore document including its ID.
 */
export interface Chapter extends ChapterDocument {
    id: string;
}

/**
 * Data required when creating a chapter.
 */
export type CreateChapterInput = Omit<
    ChapterDocument,
    "created_at" | "updated_at"
>;

/**
 * Editable fields.
 */
export type UpdateChapterInput = Partial<
    Pick<
        ChapterDocument,
        | "title"
        | "slug"
        | "chapter_order"
        | "passage"
        | "parent_chapter_id"
        | "is_hidden"
    >
>;