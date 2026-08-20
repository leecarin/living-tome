import Head from "next/head";
import { useLayoutEffect, useMemo, useRef, useState, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import SkipAnimationButton from "@/components/ui/SkipAnimationButton";
import { formatTomeLayout } from "@/lib/tomeLayoutFormatting";
import MarkdownBlock from "@/components/ui/MarkdownBlock";
import FontDropdown from "./ui/FontDropdown";
import { FontOption, TOME_FONTS, DEFAULT_FONT_STYLES } from "@/config/fonts";

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
        measureEl.querySelectorAll("[data-tome-block]"),
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
    const [selectedFont, setSelectedFont] = useState<FontOption>(TOME_FONTS[0]);

    const handleSelectFont = (font: FontOption) => {
        setSelectedFont(font);
        const root = document.documentElement;
        root.style.setProperty("--active-passage-font", font.fontFamily);
        root.style.setProperty(
            "--active-passage-size",
            font.fontSize ?? DEFAULT_FONT_STYLES.fontSize,
        );
        root.style.setProperty(
            "--active-passage-line-height",
            font.lineHeight ?? DEFAULT_FONT_STYLES.lineHeight,
        );
        root.style.setProperty(
            "--active-passage-tracking",
            font.tracking ?? DEFAULT_FONT_STYLES.tracking,
        );
    };

    const prefersReducedMotion = useReducedMotion();

    const leftPageRef = useRef<HTMLDivElement>(null);
    const leftMeasureRef = useRef<HTMLDivElement>(null);
    const rightPageRef = useRef<HTMLDivElement>(null);
    const rightMeasureRef = useRef<HTMLDivElement>(null);

    const [leftFitCount, setLeftFitCount] = useState<number | null>(null);
    const [rightFitCount, setRightFitCount] = useState<number | null>(null);

    const {
        allParagraphs,
        remainingAfterLeft,
        leftDisplayedParagraphs,
        rightDisplayedParagraphs,
    } = useMemo(
        () =>
            formatTomeLayout({
                passage,
                revealedCount,
                leftFitCount,
                rightFitCount,
            }),
        [passage, revealedCount, leftFitCount, rightFitCount],
    );

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

    const renderedLeftPage = leftPage ?? (
        <div className="space-y-5">
            <div className="chapter-title">
                <span>{headerLabel}</span>
                <span className="h-px flex-1 bg-[#c2b293]/60" />
            </div>
            <div className="chapter-body">
                {leftDisplayedParagraphs.map((para, idx) => (
                    <MarkdownBlock key={idx} content={para} />
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
                    <MarkdownBlock key={idx} content={para} />
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

            <main className="relative min-h-screen overflow-x-clip px-3 py-4 text-foreground sm:px-6 sm:py-8 lg:px-8">
                <motion.div
                    className="mx-auto w-full max-w-6xl"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* TWO-ROW STACKED TOOLBAR */}
                    <div className="relative z-50 mb-4 flex flex-col items-end gap-2.5 px-1">
                        {/* Row 1: Right-Aligned Font Selector */}
                        <div className="relative z-50 flex w-full justify-end">
                            <FontDropdown
                                selectedFontId={selectedFont.id}
                                onSelectFont={handleSelectFont}
                            />
                        </div>

                        {/* Row 2: Right-Aligned Action Buttons */}
                        <div className="flex w-full items-center justify-end gap-2">
                            <div className="shrink-0">
                                <SkipAnimationButton />
                            </div>

                            {onRefreshInk && (
                                <motion.button
                                    type="button"
                                    className="btn-ink flex shrink-0 items-center justify-center rounded-lg p-2.5 text-xs sm:px-3 sm:py-1.5"
                                    onClick={onRefreshInk}
                                    whileHover={
                                        prefersReducedMotion
                                            ? undefined
                                            : { y: -1 }
                                    }
                                    whileTap={
                                        prefersReducedMotion
                                            ? undefined
                                            : { scale: 0.96 }
                                    }
                                    aria-label="Refresh Ink"
                                >
                                    <svg
                                        className="h-3.5 w-3.5 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <motion.section className="relative z-10 overflow-hidden rounded-[2.4rem] border border-slate-700/80 bg-slate-900 p-3 shadow-[0_48px_140px_rgba(0,0,0,0.7)] ring-1 ring-black/50 sm:p-4">
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-slate-950/80 shadow-[0_0_28px_rgba(0,0,0,0.5)]" />
                        <div className="pointer-events-none absolute inset-y-3 left-1/2 w-[1px] -translate-x-1/2 bg-slate-700/40" />

                        <div className="grid gap-0 overflow-hidden rounded-[1.8rem] border border-[#d8caae]/60 bg-page-base shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] lg:grid-cols-2">
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
                                    <div
                                        className="chapter-body"
                                        style={{
                                            fontFamily: selectedFont.fontFamily,
                                        }}
                                    >
                                        {allParagraphs.map((para, idx) => (
                                            <MarkdownBlock
                                                key={idx}
                                                content={para}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

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
                                            <MarkdownBlock
                                                key={idx}
                                                content={para}
                                            />
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
