import type { Chapter } from "../db/schema";
import { serializeChapter } from "../db/serialize";


describe("serializeChapter", () => {
    const mockDate = new Date("2026-07-31T14:00:00.000Z");

    const mockTimestamp = {
        toDate: () => mockDate,
    };

    const mockChapterBase: Omit<Chapter, "created_at" | "updated_at"> = {
        id: "chap_123",
        title: "The Village of Barovia",
        slug: "solitary-cloy-1",
        chapter_order: 1,
        passage: "Dense fog clings to the tall pines...",
        user_id: "",
        parent_chapter_id: "",
        is_original: true,
        is_hidden: false,
    };

    it("should correctly serialize valid Firestore Timestamps to ISO strings", () => {
        const chapterInput = {
            ...mockChapterBase,
            created_at: mockTimestamp,
            updated_at: mockTimestamp,
        } as unknown as Chapter;

        const result = serializeChapter(chapterInput);

        expect(result).toEqual({
            ...mockChapterBase,
            created_at: "2026-07-31T14:00:00.000Z",
            updated_at: "2026-07-31T14:00:00.000Z",
        });
    });

    it("should handle serverTimestamp sentinel values (without toDate) by returning null", () => {
        // Simulates a client-side pending serverTimestamp field
        const pendingServerTimestamp = {
            _methodName: "serverTimestamp",
        };

        const chapterInput = {
            ...mockChapterBase,
            created_at: pendingServerTimestamp,
            updated_at: mockTimestamp,
        } as unknown as Chapter;

        const result = serializeChapter(chapterInput);

        expect(result.created_at).toBeNull();
        expect(result.updated_at).toBe("2026-07-31T14:00:00.000Z");
    });

    it("should return null for null or undefined timestamps", () => {
        const chapterInput = {
            ...mockChapterBase,
            created_at: null,
            updated_at: undefined,
        } as unknown as Chapter;

        const result = serializeChapter(chapterInput);

        expect(result.created_at).toBeNull();
        expect(result.updated_at).toBeNull();
    });

    it("should return null if toDate property exists but is not a function", () => {
        const malformedTimestamp = {
            toDate: "not-a-function",
        };

        const chapterInput = {
            ...mockChapterBase,
            created_at: malformedTimestamp,
            updated_at: mockTimestamp,
        } as unknown as Chapter;

        const result = serializeChapter(chapterInput);

        expect(result.created_at).toBeNull();
    });

    it("should preserve all non-timestamp chapter properties intact", () => {
        const chapterInput = {
            ...mockChapterBase,
            user_id: "usr_abc12345",
            is_hidden: true,
            created_at: mockTimestamp,
            updated_at: mockTimestamp,
        } as unknown as Chapter;

        const result = serializeChapter(chapterInput);

        expect(result.id).toBe("chap_123");
        expect(result.user_id).toBe("usr_abc12345");
        expect(result.is_hidden).toBe(true);
        expect(result.title).toBe("The Village of Barovia");
    });
});