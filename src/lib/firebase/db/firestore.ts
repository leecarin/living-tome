// src/lib/firebase/db/firestore.ts

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

import { app } from "../client";
import type {
    Chapter,
    ChapterDocument,
    CreateChapterInput,
    UpdateChapterInput,
} from "./schema";

export const db = getFirestore(app);

// Collection Name Constants
export const CHAPTERS_COLLECTION = "chapters";

/**
 * Helper to turn chapter titles into URL-friendly slugs (e.g. "The Fall of Dusk Elves" -> "the-fall-of-dusk-elves")
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function withId(id: string, data: ChapterDocument): Chapter {
    return { id, ...data };
}

// ============================================================================
// 1. READ-ONLY / ORIGINAL MOD FUNCTIONS
// ============================================================================

/**
 * Fetches all official read-only chapters from the original mod ordered by chapter index.
 */
export async function getOriginalChapters(): Promise<Chapter[]> {
    const chaptersRef = collection(db, CHAPTERS_COLLECTION);
    const q = query(
        chaptersRef,
        where("is_original", "==", true),
        where("is_hidden", "==", false),
        orderBy("chapter_order", "asc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => withId(d.id, d.data() as ChapterDocument));
}

/**
 * Fetches a single original read-only chapter by its URL slug.
 */
export async function getOriginalChapterBySlug(
    slug: string,
): Promise<Chapter | null> {
    const chaptersRef = collection(db, CHAPTERS_COLLECTION);
    const q = query(
        chaptersRef,
        where("is_original", "==", true),
        where("slug", "==", slug),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return withId(docSnap.id, docSnap.data() as ChapterDocument);
}

// ============================================================================
// 2. USER CHAPTER CRUD FUNCTIONS
// ============================================================================

/**
 * Fetches a chapter by userId and slug.
 * If `forOwner` is false (or omitted, e.g. during SSR), it explicitly queries
 * for `is_hidden == false` so Firestore rules permit the read.
 */
export async function getUserChapterByTitleOrSlug(
    userId: string,
    titleOrSlug: string,
    forOwner: boolean = false,
): Promise<Chapter | null> {
    const chaptersRef = collection(db, CHAPTERS_COLLECTION);
    const targetSlug = slugify(titleOrSlug);

    const queryConstraints = [
        where("user_id", "==", userId),
        where("slug", "==", targetSlug),
    ];

    // If not specifically fetching as the owner, restrict the query to public pages
    // so Firestore Security Rules pass!
    if (!forOwner) {
        queryConstraints.push(where("is_hidden", "==", false));
    }

    const q = query(chaptersRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return withId(docSnap.id, docSnap.data() as ChapterDocument);
}

/**
 * Fetches every chapter owned by a user (forked overrides of original
 * chapters and brand-new custom chapters alike). Intended for admin/dashboard
 * views where the user manages all of their authored content in one place,
 * as opposed to `getUserTomeSequence`, which merges overrides into the
 * public-facing original sequence.
 */
export async function getUserChapters(userId: string): Promise<Chapter[]> {
    const chaptersRef = collection(db, CHAPTERS_COLLECTION);
    const q = query(
        chaptersRef,
        where("user_id", "==", userId),
        orderBy("chapter_order", "asc"),
    );

    const snapshot = await getDocs(q);
    const chapters = snapshot.docs.map((d) =>
        withId(d.id, d.data() as ChapterDocument),
    );

    return chapters;
}

/**
 * Creates a brand new custom chapter associated with a user's account.
 */
export async function createUserChapter(
    input: CreateChapterInput,
): Promise<string> {
    const chaptersRef = collection(db, CHAPTERS_COLLECTION);

    const newDoc = await addDoc(chaptersRef, {
        ...input,
        slug: input.slug || slugify(input.title),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });

    return newDoc.id;
}

/**
 * Edits an existing user chapter passage and updates Firestore.
 * If the user is attempting to edit an original chapter, this automatically
 * forks it to create a new user-owned chapter instance.
 */
export async function editUserChapter(
    chapterId: string,
    userId: string,
    updates: UpdateChapterInput,
): Promise<void> {
    const chapterRef = doc(db, CHAPTERS_COLLECTION, chapterId);
    const docSnap = await getDoc(chapterRef);

    if (!docSnap.exists()) {
        throw new Error("Chapter not found");
    }

    const currentData = docSnap.data() as ChapterDocument;

    // Safety guard: Prevent modifying original content directly.
    // If it's an original chapter, fork it under the user's ID instead.
    if (currentData.is_original) {
        await createUserChapter({
            title: updates.title ?? currentData.title,
            slug: updates.slug ?? slugify(updates.title ?? currentData.title),
            passage: updates.passage ?? currentData.passage,
            chapter_order: updates.chapter_order ?? currentData.chapter_order,
            user_id: userId,
            parent_chapter_id: chapterId,
            is_original: false,
            is_hidden: updates.is_hidden ?? false,
        });
        return;
    }

    // Verify ownership
    if (currentData.user_id !== userId) {
        throw new Error(
            "Unauthorized: You do not have permission to edit this chapter.",
        );
    }

    const payload: Record<string, unknown> = {
        ...updates,
        updated_at: serverTimestamp(),
    };

    if (updates.title && !updates.slug) {
        payload.slug = slugify(updates.title);
    }

    await updateDoc(chapterRef, payload);
}

/**
 * Removes a user's custom chapter from Firestore.
 * Will throw an error if the user attempts to delete an original mod chapter.
 */
export async function removeUserChapter(
    chapterId: string,
    userId: string,
): Promise<void> {
    const chapterRef = doc(db, CHAPTERS_COLLECTION, chapterId);
    const docSnap = await getDoc(chapterRef);

    if (!docSnap.exists()) {
        throw new Error("Chapter not found");
    }

    const currentData = docSnap.data() as ChapterDocument;

    // Absolute Protection: Prevent deletion of original module content
    if (currentData.is_original) {
        throw new Error("Cannot delete original module chapters.");
    }

    if (currentData.user_id !== userId) {
        throw new Error(
            "Unauthorized: You do not have permission to delete this chapter.",
        );
    }

    await deleteDoc(chapterRef);
}

// ============================================================================
// 3. UTILITY & CAMPAIGN FLOW FUNCTIONS
// ============================================================================

/**
 * Toggles the hidden state of a chapter for a specific user.
 * If hidden on an original chapter, forks a user reference record set to is_hidden = true.
 */
export async function toggleChapterVisibility(
    chapterId: string,
    userId: string,
    isHidden: boolean,
): Promise<void> {
    const chapterRef = doc(db, CHAPTERS_COLLECTION, chapterId);
    const docSnap = await getDoc(chapterRef);

    if (!docSnap.exists()) return;

    const currentData = docSnap.data() as ChapterDocument;

    if (currentData.is_original) {
        // Fork original chapter as a hidden user preference record
        await createUserChapter({
            title: currentData.title,
            slug: currentData.slug,
            passage: currentData.passage,
            chapter_order: currentData.chapter_order,
            user_id: userId,
            parent_chapter_id: chapterId,
            is_original: false,
            is_hidden: isHidden,
        });
    } else if (currentData.user_id === userId) {
        await updateDoc(chapterRef, {
            is_hidden: isHidden,
            updated_at: serverTimestamp(),
        });
    }
}

/**
 * Fetches the full campaign tome for a user at their public URL (`/u/[username]`).
 * Combines original chapters with user edits/custom additions and excludes hidden chapters.
 */
export async function getUserTomeSequence(userId: string): Promise<Chapter[]> {
    const chaptersRef = collection(db, CHAPTERS_COLLECTION);

    // 1. Fetch all original chapters
    const originalQ = query(
        chaptersRef,
        where("is_original", "==", true),
        orderBy("chapter_order", "asc"),
    );
    const originalSnap = await getDocs(originalQ);
    const originals = originalSnap.docs.map((d) =>
        withId(d.id, d.data() as ChapterDocument),
    );

    // 2. Fetch all chapters owned by the user
    const userQ = query(chaptersRef, where("user_id", "==", userId));
    const userSnap = await getDocs(userQ);
    const userCustoms = userSnap.docs.map((d) =>
        withId(d.id, d.data() as ChapterDocument),
    );

    // Map of parent chapter ID -> user's override chapter
    const userOverridesMap = new Map<string, Chapter>();
    const brandNewChapters: Chapter[] = [];

    userCustoms.forEach((uc) => {
        if (uc.parent_chapter_id) {
            userOverridesMap.set(uc.parent_chapter_id, uc);
        } else {
            brandNewChapters.push(uc);
        }
    });

    // Merge original sequence with user overrides
    const finalSequence: Chapter[] = [];

    for (const original of originals) {
        const override = userOverridesMap.get(original.id);
        if (override) {
            if (!override.is_hidden) {
                finalSequence.push(override);
            }
        } else if (!original.is_hidden) {
            finalSequence.push(original);
        }
    }

    // Append new custom chapters and sort by order index
    const combined = [
        ...finalSequence,
        ...brandNewChapters.filter((c) => !c.is_hidden),
    ];
    return combined.sort((a, b) => a.chapter_order - b.chapter_order);
}
