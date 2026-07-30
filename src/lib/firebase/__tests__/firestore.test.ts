import {
    slugify,
    getOriginalChapters,
    getOriginalChapterBySlug,
    getUserChapterByTitleOrSlug,
    createUserChapter,
    editUserChapter,
    removeUserChapter,
    getUserTomeSequence,
    Chapter,
} from "../db/firestore";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    where,
    orderBy,
} from "firebase/firestore";

// Mock the firebase/firestore module
jest.mock("firebase/firestore", () => {
    return {
        getFirestore: jest.fn(),
        collection: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn(),
        getDocs: jest.fn(),
        addDoc: jest.fn(),
        updateDoc: jest.fn(),
        deleteDoc: jest.fn(),
        query: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
    };
});

// Mock the firebase client initialization file
jest.mock("../client", () => ({
    app: {},
}));

describe("Firestore DB Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =========================================================================
    // 1. Utility Tests
    // =========================================================================
    describe("slugify", () => {
        it("should convert titles into URL-safe lowercase slugs", () => {
            expect(slugify("The Fall of Dusk Elves")).toBe(
                "the-fall-of-dusk-elves",
            );
            expect(slugify("  Chapter #1: Strahd's Invitation!! ")).toBe(
                "chapter-1-strahds-invitation",
            );
            expect(slugify("Multiple   Spaces --- Here")).toBe(
                "multiple-spaces-here",
            );
        });
    });

    // =========================================================================
    // 2. Read-Only / Original Chapter Tests
    // =========================================================================
    describe("getOriginalChapters", () => {
        it("should fetch all non-hidden original module chapters ordered by chapterOrder", async () => {
            const mockOriginals = [
                {
                    id: "ch-1",
                    title: "Chapter 1",
                    userId: null,
                    chapterOrder: 1,
                    isHidden: false,
                },
                {
                    id: "ch-2",
                    title: "Chapter 2",
                    userId: null,
                    chapterOrder: 2,
                    isHidden: false,
                },
            ];

            (getDocs as jest.Mock).mockResolvedValueOnce({
                docs: mockOriginals.map((data) => ({
                    id: data.id,
                    data: () => data,
                })),
            });

            const result = await getOriginalChapters();

            expect(collection).toHaveBeenCalledWith(undefined, "chapters");
            expect(where).toHaveBeenCalledWith("userId", "==", null);
            expect(where).toHaveBeenCalledWith("isHidden", "==", false);
            expect(orderBy).toHaveBeenCalledWith("chapterOrder", "asc");
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("ch-1");
        });
    });

    describe("getOriginalChapterBySlug", () => {
        it("should return the matching original chapter if found", async () => {
            const mockChapter = {
                id: "ch-1",
                title: "Epilogue",
                slug: "epilogue",
                userId: null,
            };

            (getDocs as jest.Mock).mockResolvedValueOnce({
                empty: false,
                docs: [{ id: mockChapter.id, data: () => mockChapter }],
            });

            const result = await getOriginalChapterBySlug("epilogue");

            expect(where).toHaveBeenCalledWith("slug", "==", "epilogue");
            expect(result).not.toBeNull();
            expect(result?.title).toBe("Epilogue");
        });

        it("should return null if no matching slug is found", async () => {
            (getDocs as jest.Mock).mockResolvedValueOnce({
                empty: true,
                docs: [],
            });

            const result = await getOriginalChapterBySlug("non-existent");

            expect(result).toBeNull();
        });
    });

    // =========================================================================
    // 3. User Chapter CRUD Tests
    // =========================================================================
    describe("getUserChapterByTitleOrSlug", () => {
        it("should slugify input and query user chapters", async () => {
            const mockChapter = {
                id: "user-ch-1",
                title: "Custom Chapter",
                slug: "custom-chapter",
                userId: "user-123",
            };

            (getDocs as jest.Mock).mockResolvedValueOnce({
                empty: false,
                docs: [{ id: mockChapter.id, data: () => mockChapter }],
            });

            const result = await getUserChapterByTitleOrSlug(
                "user-123",
                "Custom Chapter",
            );

            expect(where).toHaveBeenCalledWith("userId", "==", "user-123");
            expect(where).toHaveBeenCalledWith("slug", "==", "custom-chapter");
            expect(result?.id).toBe("user-ch-1");
        });
    });

    describe("createUserChapter", () => {
        it("should create a document with auto-generated slug if omitted", async () => {
            (addDoc as jest.Mock).mockResolvedValueOnce({ id: "new-doc-id" });

            const input = {
                title: "My Custom Story",
                slug: "",
                passage: "Once upon a time in Barovia...",
                chapterOrder: 1,
                userId: "user-123",
            };

            const newId = await createUserChapter(input);

            expect(newId).toBe("new-doc-id");
            expect(addDoc).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    title: "My Custom Story",
                    slug: "my-custom-story",
                    userId: "user-123",
                    isHidden: false,
                    createdAt: "MOCK_TIMESTAMP",
                }),
            );
        });
    });

    describe("editUserChapter", () => {
        it("should update a chapter when the user is the owner", async () => {
            const existingChapter: Chapter = {
                id: "ch-user-1",
                title: "Old Title",
                slug: "old-title",
                passage: "Old content",
                chapterOrder: 1,
                userId: "user-123",
            };

            (doc as jest.Mock).mockReturnValue("doc-ref");
            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => existingChapter,
            });

            await editUserChapter("ch-user-1", "user-123", {
                passage: "New updated content",
            });

            expect(updateDoc).toHaveBeenCalledWith(
                "doc-ref",
                expect.objectContaining({
                    passage: "New updated content",
                    updatedAt: "MOCK_TIMESTAMP",
                }),
            );
        });

        it("should auto-fork an original chapter into a new user document on edit", async () => {
            const originalChapter: Chapter = {
                id: "original-ch-1",
                title: "Original Chapter",
                slug: "original-chapter",
                passage: "Original content",
                chapterOrder: 1,
                userId: null, // Original module chapter
            };

            (doc as jest.Mock).mockReturnValue("doc-ref");
            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => originalChapter,
            });
            (addDoc as jest.Mock).mockResolvedValueOnce({
                id: "forked-doc-id",
            });

            await editUserChapter("original-ch-1", "user-123", {
                passage: "Forked & edited text",
            });

            // Must NOT mutate original doc via updateDoc
            expect(updateDoc).not.toHaveBeenCalled();

            // Must create a new user-owned document linking back via parentChapterId
            expect(addDoc).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    title: "Original Chapter",
                    passage: "Forked & edited text",
                    userId: "user-123",
                    parentChapterId: "original-ch-1",
                }),
            );
        });

        it("should throw an error if an unauthorized user attempts to edit", async () => {
            const foreignChapter: Chapter = {
                id: "ch-foreign",
                title: "Someone Else's Work",
                slug: "someone-elses-work",
                passage: "Text",
                chapterOrder: 1,
                userId: "user-456",
            };

            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => foreignChapter,
            });

            await expect(
                editUserChapter("ch-foreign", "user-123", {
                    passage: "Hacked text",
                }),
            ).rejects.toThrow(
                "Unauthorized: You do not have permission to edit this chapter.",
            );
        });
    });

    describe("removeUserChapter", () => {
        it("should allow deletion of user-owned custom chapters", async () => {
            const userChapter: Chapter = {
                id: "custom-ch-1",
                title: "My Custom Chapter",
                slug: "my-custom-chapter",
                passage: "Custom text",
                chapterOrder: 5,
                userId: "user-123",
            };

            (doc as jest.Mock).mockReturnValue("doc-ref");
            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => userChapter,
            });

            await removeUserChapter("custom-ch-1", "user-123");

            expect(deleteDoc).toHaveBeenCalledWith("doc-ref");
        });

        it("should prevent deletion of original module chapters", async () => {
            const originalChapter: Chapter = {
                id: "original-ch-1",
                title: "Original Chapter",
                slug: "original-chapter",
                passage: "Original text",
                chapterOrder: 1,
                userId: null,
            };

            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => originalChapter,
            });

            await expect(
                removeUserChapter("original-ch-1", "user-123"),
            ).rejects.toThrow("Cannot delete original module chapters.");

            expect(deleteDoc).not.toHaveBeenCalled();
        });
    });

    // =========================================================================
    // 4. Sequence & Campaign Flow Tests
    // =========================================================================
    describe("getUserTomeSequence", () => {
        it("should merge original chapters with user overrides and append custom chapters sorted by order", async () => {
            const originals = [
                {
                    id: "orig-1",
                    title: "Ch 1",
                    chapterOrder: 1,
                    userId: null,
                    isHidden: false,
                },
                {
                    id: "orig-2",
                    title: "Ch 2",
                    chapterOrder: 2,
                    userId: null,
                    isHidden: false,
                },
            ];

            const userCustoms = [
                // User edited Ch 1 (override)
                {
                    id: "user-override-1",
                    title: "Ch 1 (Edited)",
                    chapterOrder: 1,
                    userId: "user-123",
                    parentChapterId: "orig-1",
                    isHidden: false,
                },
                // User added a new brand-new chapter in between
                {
                    id: "user-custom-new",
                    title: "Ch 1.5",
                    chapterOrder: 1.5,
                    userId: "user-123",
                    parentChapterId: null,
                    isHidden: false,
                },
            ];

            (getDocs as jest.Mock)
                .mockResolvedValueOnce({
                    docs: originals.map((d) => ({ id: d.id, data: () => d })),
                })
                .mockResolvedValueOnce({
                    docs: userCustoms.map((d) => ({ id: d.id, data: () => d })),
                });

            const sequence = await getUserTomeSequence("user-123");

            expect(sequence).toHaveLength(3);
            expect(sequence[0].title).toBe("Ch 1 (Edited)"); // Override applied
            expect(sequence[1].title).toBe("Ch 1.5"); // Inserted in order
            expect(sequence[2].title).toBe("Ch 2"); // Unchanged original retained
        });

        it("should omit hidden chapters from the resulting tome sequence", async () => {
            const originals = [
                {
                    id: "orig-1",
                    title: "Ch 1",
                    chapterOrder: 1,
                    userId: null,
                    isHidden: false,
                },
            ];

            const userCustoms = [
                // User hid Ch 1
                {
                    id: "user-override-1",
                    title: "Ch 1",
                    chapterOrder: 1,
                    userId: "user-123",
                    parentChapterId: "orig-1",
                    isHidden: true,
                },
            ];

            (getDocs as jest.Mock)
                .mockResolvedValueOnce({
                    docs: originals.map((d) => ({ id: d.id, data: () => d })),
                })
                .mockResolvedValueOnce({
                    docs: userCustoms.map((d) => ({ id: d.id, data: () => d })),
                });

            const sequence = await getUserTomeSequence("user-123");

            expect(sequence).toHaveLength(0);
        });
    });
});
