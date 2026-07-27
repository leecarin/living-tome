import Head from "next/head";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
    LETTER_REVEAL_BASE_DELAY_MS,
    LETTER_REVEAL_INITIAL_DELAY_MS,
    LETTER_REVEAL_LINE_BREAK_DELAY_MS,
    LETTER_REVEAL_PUNCTUATION_DELAY_MS,
} from "@/lib/chapterTiming";

const passage =
    "How many times over the centuries had I met you? How many times have I lost you? I could not say. \n\nYou ever wore the same face, under a different name, yet I would know you even if I were blind—your quick wit, your stubbornness, and the sharp-tongued quips I would endure from none other than you, are as unmistakable as they are refreshing.\n\nDespite the years, somehow I had always found a way to touch those hidden memories in your heart. And somehow, we always lose. Throughout the generations, we have lost over and over again, forever trading joy for grief.\n\nIf I could just once break the pattern, break whatever curse that keeps us apart. In doing that, I might find freedom for us both.\nBut year after year flies by; they pile into decades, mass into centuries.\n\nHow many lay before me? And are they all to be as lonely as those I've already had? Unable to answer, unwilling to guess, I sit and stare at your portrait and feel another night slipping away into the irretrievable past.\n\nIf I could just rest. Sleep. Sleep for more than just a single day, sleep away all my sorrows and lose myself in... I am unsure. To drift, dreamless and serene. To forget. To... rest.";

const chapterTitle = "Epilogue";

function getLeftPageBoundary(text: string) {
    const paragraphs = text.split(/\n\n+/).filter(Boolean);

    if (paragraphs.length === 0) {
        return 0;
    }

    const targetCharacters = Math.max(320, Math.floor(text.length * 0.56));
    let accumulatedCharacters = 0;
    let splitIndex = 0;

    for (const paragraph of paragraphs) {
        const separatorLength = splitIndex === 0 ? 0 : 2;
        const nextLength = paragraph.length + separatorLength;

        if (
            splitIndex > 0 &&
            accumulatedCharacters + nextLength > targetCharacters
        ) {
            break;
        }

        accumulatedCharacters += nextLength;
        splitIndex += 1;

        if (accumulatedCharacters >= targetCharacters) {
            break;
        }
    }

    if (splitIndex === 0) {
        splitIndex = 1;
    }

    return paragraphs.slice(0, splitIndex).join("\n\n").length;
}

const leftPageBoundary = getLeftPageBoundary(passage);

export default function LastDuskPage() {
    const prefersReducedMotion = useReducedMotion();
    const [revealCount, setRevealCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let timeoutId = 0;
        let index = 0;

        const tick = () => {
            if (cancelled) {
                return;
            }

            index += 1;
            setRevealCount(index);

            if (index >= passage.length) {
                return;
            }

            const currentChar = passage[index - 1];
            const nextDelay =
                currentChar === "\n"
                    ? LETTER_REVEAL_LINE_BREAK_DELAY_MS
                    : /[.,;:!?]/.test(currentChar)
                      ? LETTER_REVEAL_PUNCTUATION_DELAY_MS
                      : LETTER_REVEAL_BASE_DELAY_MS;
            timeoutId = window.setTimeout(tick, nextDelay);
        };

        const start = () => {
            if (cancelled) {
                return;
            }

            if (prefersReducedMotion) {
                setRevealCount(passage.length);
                return;
            }

            setRevealCount(0);
            timeoutId = window.setTimeout(tick, LETTER_REVEAL_INITIAL_DELAY_MS);
        };

        timeoutId = window.setTimeout(start, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [prefersReducedMotion]);

    const revealedText = passage.slice(0, revealCount);
    const leftText = revealedText.slice(0, leftPageBoundary);
    const rightText = revealedText
        .slice(leftPageBoundary)
        .replace(/^\n\n+/, "");

    return (
        <>
            <Head>
                <title>{chapterTitle} | The Living Tome</title>
                <meta
                    name="description"
                    content="The Last Dusk chapter, written slowly across the pages of an open book."
                />
            </Head>

            <main className="relative min-h-screen overflow-hidden px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
                <motion.div
                    className="mx-auto w-full max-w-6xl"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="mb-5 flex items-center justify-between px-1 text-[0.68rem] uppercase tracking-[0.48em] text-[var(--foreground-soft)]">
                        <span>{chapterTitle}</span>
                        <span>Chapter leaf</span>
                    </div>

                    <motion.section
                        className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(95,58,30,0.85)] bg-[linear-gradient(180deg,rgba(43,23,12,0.98),rgba(21,11,6,0.98))] p-3 shadow-[0_48px_140px_rgba(0,0,0,0.66)] ring-1 ring-black/40 sm:p-4"
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
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.06),transparent_16%,transparent_84%,rgba(0,0,0,0.12))]" />
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-[linear-gradient(to_right,rgba(74,49,25,0.95),rgba(29,16,8,0.92),rgba(74,49,25,0.95))] shadow-[0_0_28px_rgba(0,0,0,0.42)]" />
                        <div className="pointer-events-none absolute inset-y-3 left-1/2 w-[1px] -translate-x-1/2 bg-[rgba(255,237,206,0.18)]" />

                        <div className="grid gap-0 overflow-hidden rounded-[1.8rem] border border-[rgba(255,240,206,0.12)] bg-[linear-gradient(180deg,rgba(80,52,29,0.18),rgba(35,21,12,0.08))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:grid-cols-[1fr_1fr]">
                            <div className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,rgba(244,227,194,0.98),rgba(227,201,158,0.97))] px-5 py-6 text-[var(--ink)] shadow-[inset_-14px_0_28px_rgba(116,74,35,0.12),inset_0_1px_0_rgba(255,255,255,0.55)] sm:px-8 sm:py-8">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(90deg,rgba(111,74,34,0.08),transparent_10%,transparent_90%,rgba(111,74,34,0.06))] opacity-80" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[rgba(67,42,20,0.62)]">
                                            <span className="h-px flex-1 bg-[rgba(67,42,20,0.18)]" />
                                            Open leaf
                                        </div>
                                        <p className="max-w-[24rem] whitespace-pre-line text-[1.15rem] leading-9 text-[rgba(41,22,11,0.92)] sm:text-[1.3rem] sm:leading-[2.4rem]">
                                            {leftText}
                                        </p>
                                    </div>
                                    <div className="text-[0.74rem] uppercase tracking-[0.34em] text-[rgba(67,42,20,0.55)]">
                                        Left page
                                    </div>
                                </div>
                            </div>

                            <div className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,rgba(241,226,190,0.98),rgba(226,201,156,0.98))] px-5 py-6 text-[var(--ink)] shadow-[inset_14px_0_28px_rgba(116,74,35,0.1),inset_0_1px_0_rgba(255,255,255,0.54)] sm:px-8 sm:py-8">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(90deg,rgba(111,74,34,0.06),transparent_12%,transparent_88%,rgba(111,74,34,0.08))] opacity-80" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[rgba(67,42,20,0.62)]">
                                            <span className="h-px flex-1 bg-[rgba(67,42,20,0.18)]" />
                                            Open leaf
                                        </div>
                                        <motion.p
                                            key={revealCount}
                                            initial={{ opacity: 0.86 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="max-w-[24rem] whitespace-pre-line text-[1.15rem] leading-9 text-[rgba(41,22,11,0.92)] sm:text-[1.3rem] sm:leading-[2.4rem]"
                                        >
                                            {rightText}
                                        </motion.p>
                                    </div>
                                    <div className="text-[0.74rem] uppercase tracking-[0.34em] text-[rgba(67,42,20,0.55)]">
                                        Right page
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
