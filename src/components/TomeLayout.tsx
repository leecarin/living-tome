import Head from "next/head";
import { useLayoutEffect, useMemo, useRef, useState, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import SkipAnimationButton from "@/components/ui/SkipAnimationButton";

interface TomeLayoutProps {
    title: string;
    description?: string;
    headerLabel: string;
    passage?: string;
    revealedCount?: number;
    cycle?: number;
    onRefreshInk?: () => void;
    leftPage?: ReactNode;
    rightPage?: ReactNode;
}

function countFittingParagraphs(
    measureEl: HTMLElement,
    budget: number,
): number {
    const paragraphEls = Array.from(
        measureEl.querySelectorAll("p"),
    ) as HTMLElement[];
    let fitCount = paragraphEls.length;
    for (let i = 0; i < paragraphEls.length; i++) {
        if (paragraphEls[i].offsetTop + paragraphEls[i].offsetHeight > budget) {
            fitCount = i;
            break;
        }
    }
    return paragraphEls.length > 0 ? Math.max(fitCount, 1) : 0;
}

function getPageBudget(pageEl: HTMLElement): number {
    const style = getComputedStyle(pageEl);
    return (
        parseFloat(style.minHeight) -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom)
    );
}

export default function TomeLayout({
    title,
    description = "An interactive tome page.",
    headerLabel,
    passage,
    revealedCount,
    cycle = 0,
    onRefreshInk,
    leftPage,
    rightPage,
}: TomeLayoutProps) {
    const prefersReducedMotion = useReducedMotion();

    const leftPageRef = useRef<HTMLDivElement>(null);
    const leftMeasureRef = useRef<HTMLDivElement>(null);
    const rightPageRef = useRef<HTMLDivElement>(null);
    const rightMeasureRef = useRef<HTMLDivElement>(null);

    const [leftFitCount, setLeftFitCount] = useState<number | null>(null);
    const [rightFitCount, setRightFitCount] = useState<number | null>(null);

    const allParagraphs = useMemo(
        () => (passage ? passage.split(/\n\n/) : []),
        [passage],
    );

    const paragraphOffsets = useMemo(() => {
        const offsets: { start: number; end: number }[] = [];
        let cursor = 0;
        for (const para of allParagraphs) {
            const start = cursor;
            const end = start + para.length;
            offsets.push({ start, end });
            cursor = end + 2; // length of the "\n\n" separator
        }
        return offsets;
    }, [allParagraphs]);

    // Remaining paragraphs after the left page's fit-based share — used
    // only to measure the right page's capacity, not necessarily to
    // decide the final split (see `isOverflowing` below).
    const remainingAfterLeft = useMemo(
        () => (leftFitCount === null ? [] : allParagraphs.slice(leftFitCount)),
        [allParagraphs, leftFitCount],
    );

    // Step 1: how many whole paragraphs fit on the left page.
    useLayoutEffect(() => {
        const pageEl = leftPageRef.current;
        const measureEl = leftMeasureRef.current;
        if (!pageEl || !measureEl || allParagraphs.length === 0) return;

        function measure() {
            setLeftFitCount(
                countFittingParagraphs(measureEl!, getPageBudget(pageEl!)),
            );
        }

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(pageEl);
        return () => observer.disconnect();
    }, [allParagraphs]);

    // Step 2: of what's left over after the left page, how many whole
    // paragraphs fit on the right page. This is purely a measurement used
    // to detect overflow — it doesn't necessarily become the final split.
    useLayoutEffect(() => {
        const pageEl = rightPageRef.current;
        const measureEl = rightMeasureRef.current;
        if (!pageEl || !measureEl || remainingAfterLeft.length === 0) {
            setRightFitCount(0);
            return;
        }

        function measure() {
            setRightFitCount(
                countFittingParagraphs(measureEl!, getPageBudget(pageEl!)),
            );
        }

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(pageEl);
        return () => observer.disconnect();
    }, [remainingAfterLeft]);

    const { leftDisplayedParagraphs, rightDisplayedParagraphs } =
        useMemo(() => {
            if (!passage) {
                return {
                    leftDisplayedParagraphs: [],
                    rightDisplayedParagraphs: [],
                };
            }

            const hasMeasurements =
                leftFitCount !== null && rightFitCount !== null;

            // Would the fit-based split (fill left fully, then right) leave
            // any paragraphs unable to fit on either page? If so, this is a
            // "longer passage" — fall back to the original even split so
            // content isn't lost, matching pre-fit-logic behavior. If not,
            // it's a "shorter passage" — use the fit-based split so the left
            // page fills completely before the right page starts.
            const isOverflowing =
                hasMeasurements &&
                leftFitCount! + rightFitCount! < allParagraphs.length;

            let leftParagraphCount: number;
            let rightParagraphCount: number;

            if (!hasMeasurements) {
                // First paint, before measurement runs: same fallback the
                // original solution always used.
                leftParagraphCount = Math.ceil(allParagraphs.length / 2);
                rightParagraphCount = allParagraphs.length - leftParagraphCount;
            } else if (isOverflowing) {
                // Long passage: even split across both pages, as before.
                leftParagraphCount = Math.ceil(allParagraphs.length / 2);
                rightParagraphCount = allParagraphs.length - leftParagraphCount;
            } else {
                // Short passage: fill left to capacity first.
                leftParagraphCount = leftFitCount!;
                rightParagraphCount = rightFitCount!;
            }

            const leftCharLimit =
                leftParagraphCount > 0
                    ? paragraphOffsets[leftParagraphCount - 1].end
                    : 0;

            const rightStart =
                leftParagraphCount < allParagraphs.length
                    ? paragraphOffsets[leftParagraphCount].start
                    : leftCharLimit;

            const rightEnd =
                leftParagraphCount + rightParagraphCount > 0
                    ? paragraphOffsets[
                          leftParagraphCount + rightParagraphCount - 1
                      ].end
                    : rightStart;

            const effectiveCount = revealedCount ?? passage.length;
            const revealedText = passage.slice(0, effectiveCount);

            const leftRevealed = revealedText.slice(0, leftCharLimit);
            const isLeftPageFilled = leftRevealed.length >= leftCharLimit;

            const rightRevealed = isLeftPageFilled
                ? revealedText.slice(rightStart, rightEnd)
                : "";

            return {
                leftDisplayedParagraphs: leftRevealed
                    ? leftRevealed.split(/\n\n/)
                    : [],
                rightDisplayedParagraphs: rightRevealed
                    ? rightRevealed.split(/\n\n/)
                    : [],
            };
        }, [
            passage,
            revealedCount,
            allParagraphs,
            leftFitCount,
            rightFitCount,
        ]);

    const renderedLeftPage = leftPage ?? (
        <div className="space-y-5">
            <div className="chapter-title">
                <span>{headerLabel}</span>
                <span className="h-px flex-1 bg-[#c2b293]/60" />
            </div>
            <div className="chapter-body">
                {leftDisplayedParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                ))}
            </div>
        </div>
    );

    const renderedRightPage = rightPage ?? (
        <div className="space-y-5">
            <div className="chapter-title">
                <span>{headerLabel}</span>
                <span className="h-px flex-1 bg-[#c2b293]/60" />
            </div>
            <motion.div key={cycle} className="chapter-body">
                {rightDisplayedParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                ))}
            </motion.div>
        </div>
    );

    return (
        <>
            <Head>
                <title>{`${title} | Interactive Tome of Strahd`}</title>
                <meta name="description" content={description} />
            </Head>

            <main className="relative min-h-screen overflow-hidden px-4 py-8 text-foreground sm:px-6 lg:px-8">
                <motion.div
                    className="mx-auto w-full max-w-6xl"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Header Bar */}
                    <div className="mb-5 flex items-center justify-between gap-4 px-1 text-[0.68rem] uppercase tracking-[0.48em] text-foreground-soft">
                        <span>{headerLabel}</span>

                        <div className="flex items-center gap-3">
                            <SkipAnimationButton />

                            {onRefreshInk && (
                                <motion.button
                                    type="button"
                                    className="btn-ink"
                                    onClick={onRefreshInk}
                                    whileHover={
                                        prefersReducedMotion
                                            ? undefined
                                            : { y: -2 }
                                    }
                                    whileTap={
                                        prefersReducedMotion
                                            ? undefined
                                            : { scale: 0.98 }
                                    }
                                >
                                    Refresh ink
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Dark Gray Outer Tome Cover */}
                    <motion.section
                        className="relative overflow-hidden rounded-[2.4rem] border border-slate-700/80 bg-slate-900 p-3 shadow-[0_48px_140px_rgba(0,0,0,0.7)] ring-1 ring-black/50 sm:p-4"
                        whileHover={
                            prefersReducedMotion
                                ? undefined
                                : { y: -2, scale: 1.003 }
                        }
                        transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 22,
                        }}
                    >
                        {/* Book Spine Center Line */}
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-slate-950/80 shadow-[0_0_28px_rgba(0,0,0,0.5)]" />
                        <div className="pointer-events-none absolute inset-y-3 left-1/2 w-[1px] -translate-x-1/2 bg-slate-700/40" />

                        {/* Warm Yellow Pages Grid */}
                        <div className="grid gap-0 overflow-hidden rounded-[1.8rem] border border-[#d8caae]/60 bg-page-base shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] lg:grid-cols-2">
                            {/* Left Page Surface */}
                            <div
                                ref={leftPageRef}
                                className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,var(--page-top),var(--page-bottom-left))] px-5 py-6 text-ink shadow-[inset_-14px_0_28px_rgba(72,52,32,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-8 sm:py-8"
                            >
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-[linear-gradient(to_right,transparent,rgba(70,48,22,0.12))]" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    {renderedLeftPage}
                                </div>

                                <div
                                    ref={leftMeasureRef}
                                    aria-hidden="true"
                                    className="invisible pointer-events-none absolute inset-x-0 top-0 px-5 py-6 sm:px-8 sm:py-8"
                                >
                                    <div className="chapter-body">
                                        {allParagraphs.map((para, idx) => (
                                            <p key={idx}>{para}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Page Surface */}
                            <div
                                ref={rightPageRef}
                                className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,var(--page-top),var(--page-bottom-right))] px-5 py-6 text-ink shadow-[inset_14px_0_28px_rgba(72,52,32,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-8 sm:py-8"
                            >
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-[linear-gradient(to_left,transparent,rgba(70,48,22,0.12))]" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    {renderedRightPage}
                                </div>

                                <div
                                    ref={rightMeasureRef}
                                    aria-hidden="true"
                                    className="invisible pointer-events-none absolute inset-x-0 top-0 px-5 py-6 sm:px-8 sm:py-8"
                                >
                                    <div className="chapter-body">
                                        {remainingAfterLeft.map((para, idx) => (
                                            <p key={idx}>{para}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            </main>
        </>
    );
}
