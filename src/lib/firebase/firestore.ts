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
import { app } from "./client";

export const db = getFirestore(app);

// Collection Name Constants
export const CHAPTERS_COLLECTION = "chapters";

/**
 * Chapter Model representing either an original module chapter
 * or a user-customized/forked chapter.
 */
export interface Chapter {
    id: string;
    title: string;
    slug: string;
    passage: string;
    chapterOrder: number;
    userId: string | null; // null indicates original "Interactive Tome of Strahd" content
    parentChapterId?: string | null; // Reference to original chapter if forked
    isHidden?: boolean; // True if the DM hid this chapter from their campaign flow
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export type CreateChapterInput = Omit<
    Chapter,
    "id" | "createdAt" | "updatedAt"
>;
export type UpdateChapterInput = Partial<
    Omit<Chapter, "id" | "userId" | "createdAt" | "updatedAt">
>;

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
        where("userId", "==", null),
        where("isHidden", "==", false),
        orderBy("chapterOrder", "asc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Chapter, "id">),
    }));
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
        where("userId", "==", null),
        where("slug", "==", slug),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Chapter, "id">),
    };
}

// ============================================================================
// 2. USER CHAPTER CRUD FUNCTIONS
// ============================================================================

/**
 * Fetches a specific chapter passage for a given user ID by its title or slug.
 */
export async function getUserChapterByTitleOrSlug(
    userId: string,
    titleOrSlug: string,
): Promise<Chapter | null> {
    const chaptersRef = collection(db, CHAPTERS_COLLECTION);
    const targetSlug = slugify(titleOrSlug);

    const q = query(
        chaptersRef,
        where("userId", "==", userId),
        where("slug", "==", targetSlug),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Chapter, "id">),
    };
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
        isHidden: input.isHidden ?? false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return newDoc.id;
}

/**
 * Edits an existing user chapter passage and updates Firestore.
 * If the user is attempting to edit an original chapter (userId is null),
 * this automatically forks it to create a new user-owned chapter instance.
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

    const currentData = docSnap.data() as Chapter;

    // Safety guard: Prevent modifying original content directly.
    // If it's an original chapter, fork it under the user's ID instead.
    if (currentData.userId === null) {
        await createUserChapter({
            title: updates.title ?? currentData.title,
            slug: updates.slug ?? slugify(updates.title ?? currentData.title),
            passage: updates.passage ?? currentData.passage,
            chapterOrder: updates.chapterOrder ?? currentData.chapterOrder,
            userId,
            parentChapterId: chapterId,
            isHidden: updates.isHidden ?? false,
        });
        return;
    }

    // Verify ownership
    if (currentData.userId !== userId) {
        throw new Error(
            "Unauthorized: You do not have permission to edit this chapter.",
        );
    }

    const payload: Record<string, unknown> = {
        ...updates,
        updatedAt: serverTimestamp(),
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

    const currentData = docSnap.data() as Chapter;

    // Absolute Protection: Prevent deletion of original module content
    if (currentData.userId === null) {
        throw new Error("Cannot delete original module chapters.");
    }

    if (currentData.userId !== userId) {
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
 * If hidden on an original chapter, forks a user reference record set to isHidden = true.
 */
export async function toggleChapterVisibility(
    chapterId: string,
    userId: string,
    isHidden: boolean,
): Promise<void> {
    const chapterRef = doc(db, CHAPTERS_COLLECTION, chapterId);
    const docSnap = await getDoc(chapterRef);

    if (!docSnap.exists()) return;

    const currentData = docSnap.data() as Chapter;

    if (currentData.userId === null) {
        // Fork original chapter as a hidden user preference record
        await createUserChapter({
            title: currentData.title,
            slug: currentData.slug,
            passage: currentData.passage,
            chapterOrder: currentData.chapterOrder,
            userId,
            parentChapterId: chapterId,
            isHidden,
        });
    } else if (currentData.userId === userId) {
        await updateDoc(chapterRef, {
            isHidden,
            updatedAt: serverTimestamp(),
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
        where("userId", "==", null),
        orderBy("chapterOrder", "asc"),
    );
    const originalSnap = await getDocs(originalQ);
    const originals = originalSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Chapter, "id">),
    }));

    // 2. Fetch all chapters owned by the user
    const userQ = query(chaptersRef, where("userId", "==", userId));
    const userSnap = await getDocs(userQ);
    const userCustoms = userSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Chapter, "id">),
    }));

    // Map of parent ID or Chapter ID -> User Chapter Override
    const userOverridesMap = new Map<string, Chapter>();
    const brandNewChapters: Chapter[] = [];

    userCustoms.forEach((uc) => {
        if (uc.parentChapterId) {
            userOverridesMap.set(uc.parentChapterId, uc);
        } else {
            brandNewChapters.push(uc);
        }
    });

    // Merge original sequence with user overrides
    const finalSequence: Chapter[] = [];

    for (const original of originals) {
        if (userOverridesMap.has(original.id)) {
            const override = userOverridesMap.get(original.id)!;
            if (!override.isHidden) {
                finalSequence.push(override);
            }
        } else if (!original.isHidden) {
            finalSequence.push(original);
        }
    }

    // Append new custom chapters and sort by order index
    const combined = [
        ...finalSequence,
        ...brandNewChapters.filter((c) => !c.isHidden),
    ];
    return combined.sort((a, b) => a.chapterOrder - b.chapterOrder);
}
