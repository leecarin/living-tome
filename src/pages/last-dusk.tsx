import Head from "next/head";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Nothing_You_Could_Do } from "next/font/google";
import {
    LETTER_REVEAL_BASE_DELAY_MS,
    LETTER_REVEAL_INITIAL_DELAY_MS,
    LETTER_REVEAL_LINE_BREAK_DELAY_MS,
    LETTER_REVEAL_PUNCTUATION_DELAY_MS,
} from "@/lib/chapterTiming";

const bodyFont = Nothing_You_Could_Do({
    weight: "400",
});

const passage =
    "The dusk elves mistook fear for righteousness.\n\n" +
    "They murdered Patrina, believing they had saved her from a dark fate. " +
    "They called her ambition corruption, her pursuit of power a threat. " +
    "They could not comprehend greatness, so they destroyed it.\n\n" +
    "Today, I reminded them of the cost of their cowardice.\n\n" +
    "Rahadin brought their captured kin before me atop the hill overlooking Vallaki. " +
    "They stood trapped, powerless within my Forcecage, yet still clung to their pride. " +
    "Kasimir, ever the fool, spat at Rahadin and called him a traitor.\n\n" +
    "How amusing. A man who murdered his own sister speaking of betrayal.\n\n" +
    "When the remaining elves were found and brought before me, I gave them the punishment they had earned. " +
    "My magic tore through their ranks, and their screams filled the night.\n\n" +
    "Kasimir attempted defiance, summoning a storm of ice against me. " +
    "I dismissed his spell as easily as one brushes aside a candle flame.\n\n" +
    "Rahadin removed one of his ears for his insolence, leaving him one so he might hear the cries of his people.\n\n" +
    "Hear them he did. " +
    "One by one, the dusk elves became ash upon the hill where they believed themselves righteous.\n\n" +
    "Let this serve as a reminder: those who fear power will always be consumed by it.";

const chapterTitle = "The Fall of the Dusk Elves";

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

export default function DuskElfGenocidePage() {
    const prefersReducedMotion = useReducedMotion();
    const [revealCount, setRevealCount] = useState(0);
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let timeoutId = 0;
        let index = 0;

        const tick = () => {
            if (cancelled) return;

            index += 1;
            setRevealCount(index);

            if (index >= passage.length) return;

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
            if (cancelled) return;

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
    }, [cycle, prefersReducedMotion]);

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
                    content="Strahd's account of the destruction of the dusk elves."
                />
            </Head>

            <main className="relative min-h-screen overflow-hidden px-4 py-8 text-foreground sm:px-6 lg:px-8">
                <motion.div
                    className="mx-auto w-full max-w-6xl"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <div className="mb-5 flex items-center justify-between gap-4 px-1 text-[0.68rem] uppercase tracking-[0.48em] text-foreground-soft">
                        <span>{chapterTitle}</span>

                        <div className="flex items-center gap-4">
                            <motion.button
                                type="button"
                                className="rounded-full border border-[#c2b293] bg-[#f5ede0] px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-[#4a3828] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                                onClick={() => setCycle((value) => value + 1)}
                                whileHover={
                                    prefersReducedMotion ? undefined : { y: -2 }
                                }
                                whileTap={
                                    prefersReducedMotion
                                        ? undefined
                                        : { scale: 0.98 }
                                }
                            >
                                Refresh ink
                            </motion.button>
                        </div>
                    </div>

                    {/* Dark Gray Outer Tome Cover */}
                    <motion.section
                        className="relative overflow-hidden rounded-[2.4rem] border border-slate-700/80 bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(15,23,42,0.98))] p-3 shadow-[0_48px_140px_rgba(0,0,0,0.7)] ring-1 ring-black/50 sm:p-4"
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
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)]" />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.08),transparent_16%,transparent_84%,rgba(0,0,0,0.15))]" />
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-[linear-gradient(to_right,rgba(30,41,59,0.95),rgba(15,23,42,0.92),rgba(30,41,59,0.95))] shadow-[0_0_28px_rgba(0,0,0,0.5)]" />
                        <div className="pointer-events-none absolute inset-y-3 left-1/2 w-[1px] -translate-x-1/2 bg-[rgba(226,232,240,0.18)]" />

                        {/* Yellow Parchment Pages */}
                        <div className="grid gap-0 overflow-hidden rounded-[1.8rem] border border-[#d8caae]/60 bg-[#eedebf] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] lg:grid-cols-[1fr_1fr]">
                            <div className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,#fbf7ee,#f2e9d8)] px-5 py-6 text-ink shadow-[inset_-14px_0_28px_rgba(72,52,32,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-8 sm:py-8">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.45),transparent_26%),linear-gradient(90deg,rgba(110,80,45,0.05),transparent_10%,transparent_90%,rgba(110,80,45,0.04))] opacity-80" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[#8c7457]">
                                            <span className="h-px flex-1 bg-[#cfbe9e]" />
                                            {chapterTitle}
                                        </div>
                                        <p
                                            className={`${bodyFont.className} max-w-[28rem] whitespace-pre-line text-[1.5rem] leading-9 text-[#24170d] sm:text-[1.3rem] sm:leading-[2.8rem]`}
                                        >
                                            {leftText}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,#fbf7ee,#ece2cc)] px-5 py-6 text-ink shadow-[inset_14px_0_28px_rgba(72,52,32,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-8 sm:py-8">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.35),transparent_24%),linear-gradient(90deg,rgba(110,80,45,0.04),transparent_12%,transparent_88%,rgba(110,80,45,0.06))] opacity-80" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[#8c7457]">
                                            <span className="h-px flex-1 bg-[#cfbe9e]" />
                                            {chapterTitle}
                                        </div>
                                        <motion.p
                                            key={revealCount}
                                            initial={{ opacity: 0.86 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={`${bodyFont.className} max-w-[28rem] whitespace-pre-line text-[1.5rem] leading-9 text-[#24170d] sm:text-[1.3rem] sm:leading-[2.4rem]`}
                                        >
                                            {rightText}
                                        </motion.p>
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
