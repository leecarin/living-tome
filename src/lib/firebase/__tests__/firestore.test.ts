// src/lib/firebase/__tests__/firestore.test.ts

import {
    // getFirestore,
    // collection,
    // doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    // query,
    where,
    orderBy,
    // serverTimestamp,
} from "firebase/firestore";

// --- Mock the firebase/firestore SDK ---------------------------------------
jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({ __type: "db" })),
    collection: jest.fn((_db, name) => ({ __type: "collectionRef", name })),
    doc: jest.fn((_db, name, id) => ({ __type: "docRef", name, id })),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn((ref, ...clauses) => ({ __type: "query", ref, clauses })),
    where: jest.fn((field, op, value) => ({ __type: "where", field, op, value })),
    orderBy: jest.fn((field, direction) => ({ __type: "orderBy", field, direction })),
    serverTimestamp: jest.fn(() => "__SERVER_TIMESTAMP__"),
}));

// --- Mock the firebase app client -------------------------------------------
jest.mock("../client", () => ({ app: { __type: "app" } }));

import * as firestoreDb from "../db/firestore";
import type { ChapterDocument } from "../db/schema";

const mockGetDoc = getDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockAddDoc = addDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockDeleteDoc = deleteDoc as jest.Mock;
const mockWhere = where as jest.Mock;
const mockOrderBy = orderBy as jest.Mock;

// --- Test helpers ------------------------------------------------------------

function makeChapterDoc(overrides: Partial<ChapterDocument> = {}): ChapterDocument {
    return {
        title: "The Fall of Dusk Elves",
        slug: "the-fall-of-dusk-elves",
        chapter_order: 1,
        passage: "Once upon a time...",
        user_id: null,
        parent_chapter_id: null,
        is_original: true,
        is_hidden: false,
        created_at: "__SERVER_TIMESTAMP__" as unknown as ChapterDocument["created_at"],
        updated_at: "__SERVER_TIMESTAMP__" as unknown as ChapterDocument["updated_at"],
        ...overrides,
    };
}

function makeDocSnap(id: string, data: ChapterDocument | null) {
    return {
        exists: () => data !== null,
        id,
        data: () => data,
    };
}

function makeQuerySnapshot(entries: Array<{ id: string; data: ChapterDocument }>) {
    return {
        empty: entries.length === 0,
        docs: entries.map((e) => ({ id: e.id, data: () => e.data })),
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

// =============================================================================
// slugify
// =============================================================================

describe("slugify", () => {
    it("lowercases, trims, and hyphenates a title", () => {
        expect(firestoreDb.slugify("The Fall of Dusk Elves")).toBe(
            "the-fall-of-dusk-elves",
        );
    });

    it("strips punctuation and special characters", () => {
        expect(firestoreDb.slugify("Barovia: A Land of Mist & Shadow!")).toBe(
            "barovia-a-land-of-mist-shadow",
        );
    });

    it("collapses repeated whitespace and dashes", () => {
        expect(firestoreDb.slugify("  Too   Many    Spaces  ")).toBe(
            "too-many-spaces",
        );
        expect(firestoreDb.slugify("already--hyphenated---text")).toBe(
            "already-hyphenated-text",
        );
    });
});

// =============================================================================
// getOriginalChapters
// =============================================================================

describe("getOriginalChapters", () => {
    it("queries for original, non-hidden chapters ordered by chapter_order", async () => {
        const chapterData = makeChapterDoc();
        mockGetDocs.mockResolvedValueOnce(
            makeQuerySnapshot([{ id: "chapter-1", data: chapterData }]),
        );

        const result = await firestoreDb.getOriginalChapters();

        expect(mockWhere).toHaveBeenCalledWith("is_original", "==", true);
        expect(mockWhere).toHaveBeenCalledWith("is_hidden", "==", false);
        expect(mockOrderBy).toHaveBeenCalledWith("chapter_order", "asc");
        expect(result).toEqual([{ id: "chapter-1", ...chapterData }]);
    });

    it("returns an empty array when there are no matching chapters", async () => {
        mockGetDocs.mockResolvedValueOnce(makeQuerySnapshot([]));

        const result = await firestoreDb.getOriginalChapters();

        expect(result).toEqual([]);
    });
});

// =============================================================================
// getOriginalChapterBySlug
// =============================================================================

describe("getOriginalChapterBySlug", () => {
    it("returns null when no chapter matches the slug", async () => {
        mockGetDocs.mockResolvedValueOnce(makeQuerySnapshot([]));

        const result = await firestoreDb.getOriginalChapterBySlug("nonexistent");

        expect(result).toBeNull();
    });

    it("returns the matching original chapter", async () => {
        const chapterData = makeChapterDoc({ slug: "death-house" });
        mockGetDocs.mockResolvedValueOnce(
            makeQuerySnapshot([{ id: "chapter-2", data: chapterData }]),
        );

        const result = await firestoreDb.getOriginalChapterBySlug("death-house");

        expect(mockWhere).toHaveBeenCalledWith("is_original", "==", true);
        expect(mockWhere).toHaveBeenCalledWith("slug", "==", "death-house");
        expect(result).toEqual({ id: "chapter-2", ...chapterData });
    });
});

// =============================================================================
// getUserChapterByTitleOrSlug
// =============================================================================

describe("getUserChapterByTitleOrSlug", () => {
    it("slugifies the input before querying and returns null on no match", async () => {
        mockGetDocs.mockResolvedValueOnce(makeQuerySnapshot([]));

        const result = await firestoreDb.getUserChapterByTitleOrSlug(
            "user-1",
            "My Custom Chapter!",
        );

        expect(mockWhere).toHaveBeenCalledWith("user_id", "==", "user-1");
        expect(mockWhere).toHaveBeenCalledWith(
            "slug",
            "==",
            "my-custom-chapter",
        );
        expect(result).toBeNull();
    });

    it("returns the matching user chapter", async () => {
        const chapterData = makeChapterDoc({
            user_id: "user-1",
            is_original: false,
            slug: "my-custom-chapter",
        });
        mockGetDocs.mockResolvedValueOnce(
            makeQuerySnapshot([{ id: "chapter-3", data: chapterData }]),
        );

        const result = await firestoreDb.getUserChapterByTitleOrSlug(
            "user-1",
            "my-custom-chapter",
        );

        expect(result).toEqual({ id: "chapter-3", ...chapterData });
    });
});

// =============================================================================
// createUserChapter
// =============================================================================

describe("createUserChapter", () => {
    it("creates a chapter with a derived slug and server timestamps when no slug given", async () => {
        mockAddDoc.mockResolvedValueOnce({ id: "new-chapter-id" });

        const input = {
            title: "Brand New Chapter",
            slug: "",
            chapter_order: 5,
            passage: "Some passage",
            user_id: "user-1",
            parent_chapter_id: null,
            is_original: false,
            is_hidden: false,
        };

        const id = await firestoreDb.createUserChapter(input);

        expect(id).toBe("new-chapter-id");
        expect(mockAddDoc).toHaveBeenCalledTimes(1);
        const [, payload] = mockAddDoc.mock.calls[0];
        expect(payload).toMatchObject({
            title: "Brand New Chapter",
            slug: "brand-new-chapter",
            user_id: "user-1",
            is_original: false,
            created_at: "__SERVER_TIMESTAMP__",
            updated_at: "__SERVER_TIMESTAMP__",
        });
    });

    it("uses the provided slug when one is supplied", async () => {
        mockAddDoc.mockResolvedValueOnce({ id: "new-chapter-id-2" });

        await firestoreDb.createUserChapter({
            title: "Another Chapter",
            slug: "custom-slug",
            chapter_order: 6,
            passage: "Passage text",
            user_id: "user-1",
            parent_chapter_id: null,
            is_original: false,
            is_hidden: false,
        });

        const [, payload] = mockAddDoc.mock.calls[0];
        expect(payload.slug).toBe("custom-slug");
    });
});

// =============================================================================
// editUserChapter
// =============================================================================

describe("editUserChapter", () => {
    it("throws when the chapter does not exist", async () => {
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("missing", null));

        await expect(
            firestoreDb.editUserChapter("missing", "user-1", { title: "X" }),
        ).rejects.toThrow("Chapter not found");
    });

    it("forks an original chapter into a new user chapter instead of editing it", async () => {
        const original = makeChapterDoc({
            title: "Original Title",
            is_original: true,
            user_id: null,
            chapter_order: 3,
        });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("orig-1", original));
        mockAddDoc.mockResolvedValueOnce({ id: "forked-id" });

        await firestoreDb.editUserChapter("orig-1", "user-1", {
            passage: "Edited passage",
        });

        expect(mockUpdateDoc).not.toHaveBeenCalled();
        expect(mockAddDoc).toHaveBeenCalledTimes(1);
        const [, payload] = mockAddDoc.mock.calls[0];
        expect(payload).toMatchObject({
            title: "Original Title",
            passage: "Edited passage",
            chapter_order: 3,
            user_id: "user-1",
            parent_chapter_id: "orig-1",
            is_original: false,
            is_hidden: false,
        });
    });

    it("throws Unauthorized when a non-owner attempts to edit a user chapter", async () => {
        const owned = makeChapterDoc({
            is_original: false,
            user_id: "owner-1",
        });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("chapter-5", owned));

        await expect(
            firestoreDb.editUserChapter("chapter-5", "someone-else", {
                passage: "Hacked",
            }),
        ).rejects.toThrow("Unauthorized");

        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it("updates the chapter in place when the caller owns it", async () => {
        const owned = makeChapterDoc({
            is_original: false,
            user_id: "user-1",
            slug: "old-slug",
        });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("chapter-6", owned));

        await firestoreDb.editUserChapter("chapter-6", "user-1", {
            title: "New Title",
        });

        expect(mockAddDoc).not.toHaveBeenCalled();
        expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
        const [, payload] = mockUpdateDoc.mock.calls[0];
        expect(payload).toMatchObject({
            title: "New Title",
            slug: "new-title", // auto-derived since no slug was supplied
            updated_at: "__SERVER_TIMESTAMP__",
        });
    });

    it("does not override an explicitly provided slug", async () => {
        const owned = makeChapterDoc({ is_original: false, user_id: "user-1" });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("chapter-7", owned));

        await firestoreDb.editUserChapter("chapter-7", "user-1", {
            title: "New Title",
            slug: "explicit-slug",
        });

        const [, payload] = mockUpdateDoc.mock.calls[0];
        expect(payload.slug).toBe("explicit-slug");
    });
});

// =============================================================================
// removeUserChapter
// =============================================================================

describe("removeUserChapter", () => {
    it("throws when the chapter does not exist", async () => {
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("missing", null));

        await expect(
            firestoreDb.removeUserChapter("missing", "user-1"),
        ).rejects.toThrow("Chapter not found");
    });

    it("throws when attempting to delete an original chapter", async () => {
        const original = makeChapterDoc({ is_original: true, user_id: null });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("orig-1", original));

        await expect(
            firestoreDb.removeUserChapter("orig-1", "user-1"),
        ).rejects.toThrow("Cannot delete original module chapters.");

        expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it("throws Unauthorized when a non-owner attempts to delete a user chapter", async () => {
        const owned = makeChapterDoc({ is_original: false, user_id: "owner-1" });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("chapter-8", owned));

        await expect(
            firestoreDb.removeUserChapter("chapter-8", "someone-else"),
        ).rejects.toThrow("Unauthorized");

        expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it("deletes the chapter when the caller owns it", async () => {
        const owned = makeChapterDoc({ is_original: false, user_id: "user-1" });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("chapter-9", owned));

        await firestoreDb.removeUserChapter("chapter-9", "user-1");

        expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });
});

// =============================================================================
// toggleChapterVisibility
// =============================================================================

describe("toggleChapterVisibility", () => {
    it("does nothing when the chapter does not exist", async () => {
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("missing", null));

        await firestoreDb.toggleChapterVisibility("missing", "user-1", true);

        expect(mockAddDoc).not.toHaveBeenCalled();
        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it("forks an original chapter into a hidden user record", async () => {
        const original = makeChapterDoc({ is_original: true, user_id: null });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("orig-1", original));
        mockAddDoc.mockResolvedValueOnce({ id: "forked-hidden-id" });

        await firestoreDb.toggleChapterVisibility("orig-1", "user-1", true);

        expect(mockAddDoc).toHaveBeenCalledTimes(1);
        const [, payload] = mockAddDoc.mock.calls[0];
        expect(payload).toMatchObject({
            parent_chapter_id: "orig-1",
            user_id: "user-1",
            is_original: false,
            is_hidden: true,
        });
        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it("updates is_hidden in place when the caller owns the chapter", async () => {
        const owned = makeChapterDoc({ is_original: false, user_id: "user-1" });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("chapter-10", owned));

        await firestoreDb.toggleChapterVisibility("chapter-10", "user-1", true);

        expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
        const [, payload] = mockUpdateDoc.mock.calls[0];
        expect(payload).toMatchObject({
            is_hidden: true,
            updated_at: "__SERVER_TIMESTAMP__",
        });
        expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it("does nothing when the caller does not own a non-original chapter", async () => {
        const owned = makeChapterDoc({ is_original: false, user_id: "owner-1" });
        mockGetDoc.mockResolvedValueOnce(makeDocSnap("chapter-11", owned));

        await firestoreDb.toggleChapterVisibility(
            "chapter-11",
            "someone-else",
            true,
        );

        expect(mockAddDoc).not.toHaveBeenCalled();
        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
});

// =============================================================================
// getUserTomeSequence
// =============================================================================

describe("getUserTomeSequence", () => {
    it("merges originals with user overrides, applying hidden filters and sort order", async () => {
        const original1 = makeChapterDoc({
            title: "Chapter One",
            chapter_order: 1,
            is_original: true,
            user_id: null,
        });
        const original2 = makeChapterDoc({
            title: "Chapter Two",
            chapter_order: 2,
            is_original: true,
            user_id: null,
        });
        const original3 = makeChapterDoc({
            title: "Chapter Three (hidden by user)",
            chapter_order: 3,
            is_original: true,
            user_id: null,
        });

        // originals query
        mockGetDocs.mockResolvedValueOnce(
            makeQuerySnapshot([
                { id: "orig-1", data: original1 },
                { id: "orig-2", data: original2 },
                { id: "orig-3", data: original3 },
            ]),
        );

        const overrideForChapterTwo = makeChapterDoc({
            title: "Chapter Two (Edited)",
            chapter_order: 2,
            is_original: false,
            user_id: "user-1",
            parent_chapter_id: "orig-2",
            is_hidden: false,
        });
        const hiddenOverrideForChapterThree = makeChapterDoc({
            title: "Chapter Three (hidden by user)",
            chapter_order: 3,
            is_original: false,
            user_id: "user-1",
            parent_chapter_id: "orig-3",
            is_hidden: true,
        });
        const brandNewChapter = makeChapterDoc({
            title: "User's Bonus Chapter",
            chapter_order: 0.5,
            is_original: false,
            user_id: "user-1",
            parent_chapter_id: null,
            is_hidden: false,
        });

        // user-owned chapters query
        mockGetDocs.mockResolvedValueOnce(
            makeQuerySnapshot([
                { id: "user-chapter-2", data: overrideForChapterTwo },
                { id: "user-chapter-3", data: hiddenOverrideForChapterThree },
                { id: "user-chapter-bonus", data: brandNewChapter },
            ]),
        );

        const result = await firestoreDb.getUserTomeSequence("user-1");

        expect(result.map((c) => c.title)).toEqual([
            "User's Bonus Chapter",
            "Chapter One",
            "Chapter Two (Edited)",
        ]);
        // Chapter Three should be excluded entirely (hidden via user override)
        expect(
            result.find((c) => c.title.startsWith("Chapter Three")),
        ).toBeUndefined();
    });

    it("excludes hidden originals that have no user override", async () => {
        const hiddenOriginal = makeChapterDoc({
            title: "Hidden Original",
            chapter_order: 1,
            is_original: true,
            user_id: null,
            is_hidden: true,
        });
        const visibleOriginal = makeChapterDoc({
            title: "Visible Original",
            chapter_order: 2,
            is_original: true,
            user_id: null,
            is_hidden: false,
        });

        mockGetDocs.mockResolvedValueOnce(
            makeQuerySnapshot([
                { id: "orig-1", data: hiddenOriginal },
                { id: "orig-2", data: visibleOriginal },
            ]),
        );
        mockGetDocs.mockResolvedValueOnce(makeQuerySnapshot([]));

        const result = await firestoreDb.getUserTomeSequence("user-1");

        expect(result.map((c) => c.title)).toEqual(["Visible Original"]);
    });

    it("returns an empty array when there are no chapters at all", async () => {
        mockGetDocs.mockResolvedValueOnce(makeQuerySnapshot([]));
        mockGetDocs.mockResolvedValueOnce(makeQuerySnapshot([]));

        const result = await firestoreDb.getUserTomeSequence("user-1");

        expect(result).toEqual([]);
    });
});