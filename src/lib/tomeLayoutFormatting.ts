export interface TomeLayoutFormattingInput {
    passage?: string;
    revealedCount?: number;
    leftFitCount: number | null;
    rightFitCount: number | null;
}

export interface TomeLayoutFormattingResult {
    allParagraphs: string[];
    remainingAfterLeft: string[];
    leftDisplayedParagraphs: string[];
    rightDisplayedParagraphs: string[];
}

interface ParagraphOffset {
    start: number;
    end: number;
}

import { splitPassageIntoBlocks } from "./tomeMarkdownFormatting";

function buildParagraphOffsets(paragraphs: string[]): ParagraphOffset[] {
    const offsets: ParagraphOffset[] = [];
    let cursor = 0;

    for (const paragraph of paragraphs) {
        const start = cursor;
        const end = start + paragraph.length;
        offsets.push({ start, end });
        cursor = end + 2;
    }

    return offsets;
}

export function formatTomeLayout({
    passage,
    revealedCount,
    leftFitCount,
    rightFitCount,
}: TomeLayoutFormattingInput): TomeLayoutFormattingResult {
    const allParagraphs = splitPassageIntoBlocks(passage);

    if (!passage || allParagraphs.length === 0) {
        return {
            allParagraphs,
            remainingAfterLeft: [],
            leftDisplayedParagraphs: [],
            rightDisplayedParagraphs: [],
        };
    }

    const paragraphOffsets = buildParagraphOffsets(allParagraphs);
    const remainingAfterLeft =
        leftFitCount === null ? [] : allParagraphs.slice(leftFitCount);

    const hasMeasurements = leftFitCount !== null && rightFitCount !== null;
    const isOverflowing =
        hasMeasurements && leftFitCount + rightFitCount < allParagraphs.length;

    let leftParagraphCount: number;
    let rightParagraphCount: number;

    if (!hasMeasurements || isOverflowing) {
        leftParagraphCount = Math.ceil(allParagraphs.length / 2);
        rightParagraphCount = allParagraphs.length - leftParagraphCount;
    } else {
        leftParagraphCount = leftFitCount;
        rightParagraphCount = rightFitCount;
    }

    const leftCharLimit =
        leftParagraphCount > 0 && paragraphOffsets[leftParagraphCount - 1]
            ? paragraphOffsets[leftParagraphCount - 1].end
            : 0;

    const rightStart =
        leftParagraphCount < paragraphOffsets.length
            ? paragraphOffsets[leftParagraphCount].start
            : leftCharLimit;

    const totalCount = leftParagraphCount + rightParagraphCount;
    const targetIndex = Math.min(totalCount, paragraphOffsets.length) - 1;

    const rightEnd =
        totalCount > 0 && targetIndex >= 0 && paragraphOffsets[targetIndex]
            ? paragraphOffsets[targetIndex].end
            : rightStart;

    const effectiveCount = revealedCount ?? passage.length;
    const revealedText = passage.slice(0, effectiveCount);

    const leftRevealed = revealedText.slice(0, leftCharLimit);
    const isLeftPageFilled = leftRevealed.length >= leftCharLimit;

    const rightRevealed = isLeftPageFilled
        ? revealedText.slice(rightStart, rightEnd)
        : "";

    return {
        allParagraphs,
        remainingAfterLeft,
        leftDisplayedParagraphs: leftRevealed ? leftRevealed.split(/\n\n/) : [],
        rightDisplayedParagraphs: rightRevealed
            ? rightRevealed.split(/\n\n/)
            : [],
    };
}
