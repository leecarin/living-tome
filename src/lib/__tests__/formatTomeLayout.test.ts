// src/lib/__tests__/formatTomeLayout.test.ts

import { formatTomeLayout } from "../tomeLayoutFormatting";

describe("formatTomeLayout", () => {
    const passage = [
        "Paragraph One",
        "Paragraph Two",
        "Paragraph Three",
        "Paragraph Four",
    ].join("\n\n");

    describe("empty passages", () => {
        it("returns empty arrays when passage is undefined", () => {
            expect(
                formatTomeLayout({
                    passage: undefined,
                    revealedCount: undefined,
                    leftFitCount: null,
                    rightFitCount: null,
                }),
            ).toEqual({
                allParagraphs: [],
                remainingAfterLeft: [],
                leftDisplayedParagraphs: [],
                rightDisplayedParagraphs: [],
            });
        });

        it("returns empty arrays when passage is empty", () => {
            expect(
                formatTomeLayout({
                    passage: "",
                    revealedCount: undefined,
                    leftFitCount: null,
                    rightFitCount: null,
                }),
            ).toEqual({
                allParagraphs: [],
                remainingAfterLeft: [],
                leftDisplayedParagraphs: [],
                rightDisplayedParagraphs: [],
            });
        });
    });

    describe("paragraph splitting", () => {
        it("splits all paragraphs correctly", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: null,
                rightFitCount: null,
            });

            expect(result.allParagraphs).toEqual([
                "Paragraph One",
                "Paragraph Two",
                "Paragraph Three",
                "Paragraph Four",
            ]);
        });

        it("returns remaining paragraphs after the left page", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: 2,
                rightFitCount: 2,
            });

            expect(result.remainingAfterLeft).toEqual([
                "Paragraph Three",
                "Paragraph Four",
            ]);
        });
    });

    describe("default layout", () => {
        it("splits evenly when measurements are unavailable", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: null,
                rightFitCount: null,
            });

            expect(result.leftDisplayedParagraphs).toEqual([
                "Paragraph One",
                "Paragraph Two",
            ]);

            expect(result.rightDisplayedParagraphs).toEqual([
                "Paragraph Three",
                "Paragraph Four",
            ]);
        });
    });

    describe("measured layout", () => {
        it("uses measured page sizes when everything fits", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: 3,
                rightFitCount: 1,
            });

            expect(result.leftDisplayedParagraphs).toEqual([
                "Paragraph One",
                "Paragraph Two",
                "Paragraph Three",
            ]);

            expect(result.rightDisplayedParagraphs).toEqual(["Paragraph Four"]);
        });

        it("falls back to an even split when measured layout overflows", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: 1,
                rightFitCount: 1,
            });

            expect(result.leftDisplayedParagraphs).toEqual([
                "Paragraph One",
                "Paragraph Two",
            ]);

            expect(result.rightDisplayedParagraphs).toEqual([
                "Paragraph Three",
                "Paragraph Four",
            ]);
        });
    });

    describe("revealed text", () => {
        it("reveals only the left page until it is complete", () => {
            const revealLength = "Paragraph One".length + 3;

            const result = formatTomeLayout({
                passage,
                revealedCount: revealLength,
                leftFitCount: 2,
                rightFitCount: 2,
            });

            expect(result.leftDisplayedParagraphs.length).toBeGreaterThan(0);
            expect(result.rightDisplayedParagraphs).toEqual([]);
        });

        it("reveals both pages once the left page is complete", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: 2,
                rightFitCount: 2,
            });

            expect(result.rightDisplayedParagraphs).toEqual([
                "Paragraph Three",
                "Paragraph Four",
            ]);
        });

        it("defaults to revealing the entire passage", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: undefined,
                leftFitCount: 2,
                rightFitCount: 2,
            });

            expect(result.leftDisplayedParagraphs).toEqual([
                "Paragraph One",
                "Paragraph Two",
            ]);

            expect(result.rightDisplayedParagraphs).toEqual([
                "Paragraph Three",
                "Paragraph Four",
            ]);
        });
    });

    describe("edge cases", () => {
        it("handles a single paragraph", () => {
            const result = formatTomeLayout({
                passage: "Only Paragraph",
                revealedCount: undefined,
                leftFitCount: null,
                rightFitCount: null,
            });

            expect(result.leftDisplayedParagraphs).toEqual(["Only Paragraph"]);

            expect(result.rightDisplayedParagraphs).toEqual([]);
        });

        it("handles no right page content", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: 4,
                rightFitCount: 0,
            });

            expect(result.leftDisplayedParagraphs).toEqual([
                "Paragraph One",
                "Paragraph Two",
                "Paragraph Three",
                "Paragraph Four",
            ]);

            expect(result.rightDisplayedParagraphs).toEqual([]);
        });

        it("handles zero revealed characters", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: 0,
                leftFitCount: 2,
                rightFitCount: 2,
            });

            expect(result.leftDisplayedParagraphs).toEqual([]);
            expect(result.rightDisplayedParagraphs).toEqual([]);
        });

        it("splits an odd number of paragraphs evenly", () => {
            const oddPassage = ["One", "Two", "Three", "Four", "Five"].join(
                "\n\n",
            );

            const result = formatTomeLayout({
                passage: oddPassage,
                revealedCount: oddPassage.length,
                leftFitCount: null,
                rightFitCount: null,
            });

            expect(result.leftDisplayedParagraphs).toEqual([
                "One",
                "Two",
                "Three",
            ]);

            expect(result.rightDisplayedParagraphs).toEqual(["Four", "Five"]);
        });

        it("handles zero paragraphs fitting on the left page", () => {
            const result = formatTomeLayout({
                passage,
                revealedCount: passage.length,
                leftFitCount: 0,
                rightFitCount: 4,
            });

            expect(result.leftDisplayedParagraphs).toEqual([]);

            expect(result.rightDisplayedParagraphs).toEqual([
                "Paragraph One",
                "Paragraph Two",
                "Paragraph Three",
                "Paragraph Four",
            ]);
        });

        it("reveals a partial paragraph without creating extra paragraphs", () => {
            const revealLength = "Paragraph One\n\nParag".length;

            const result = formatTomeLayout({
                passage,
                revealedCount: revealLength,
                leftFitCount: 2,
                rightFitCount: 2,
            });

            expect(result.leftDisplayedParagraphs).toEqual([
                "Paragraph One",
                "Parag",
            ]);

            expect(result.rightDisplayedParagraphs).toEqual([]);
        });
    });
});
