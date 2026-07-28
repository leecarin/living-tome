import { useEffect, useState, useMemo } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { isAnimatingAtom, skipAnimationSignalAtom } from "@/store/animation";
import { motion, useReducedMotion } from "motion/react";
import { Nothing_You_Could_Do } from "next/font/google";
import TomeLayout from "@/components/TomeLayout";
import {
    LETTER_REVEAL_BASE_DELAY_MS,
    LETTER_REVEAL_INITIAL_DELAY_MS,
    LETTER_REVEAL_LINE_BREAK_DELAY_MS,
    LETTER_REVEAL_PUNCTUATION_DELAY_MS,
} from "@/lib/chapterTiming";

const bodyFont = Nothing_You_Could_Do({ weight: "400" });

const passage =
    "How many times over the centuries had I met you? How many times have I lost you? I could not say. " +
    "\n\nYou ever wore the same face, under a different name, yet I would know you even if I were blind — " +
    "your quick wit, your stubbornness, and the sharp-tongued quips I would endure from none other, are as " +
    "unmistakable as they are refreshing.\n\nDespite the years, somehow I had always found a way to touch those " +
    "hidden memories in your heart. And somehow, we always lose. Throughout the generations, we have lost over " +
    "and over again, forever trading joy for grief.\n\nIf I could just once break the pattern, break whatever " +
    "curse that keeps us apart. In doing that, I might find freedom for us both.\n\nBut year after year flies by; " +
    "they pile into decades, mass into centuries.\n\nHow many lay before me? And are they all to be as lonely as " +
    "those I've already had? Unable to answer, unwilling to guess, I sit and stare at your portrait and feel " +
    "another night slipping away into the irretrievable past.\n\nIf I could just rest. Sleep. Sleep for more " +
    "than just a single day, sleep away all my sorrows and lose myself in...I am unsure. To drift, dreamless " +
    "and serene. To forget. To...rest.";

const chapterTitle = "Epilogue";

export default function EpiloguePage() {
    const prefersReducedMotion = useReducedMotion();
    const [revealCount, setRevealCount] = useState(0);
    const [cycle, setCycle] = useState(0);

    const setIsAnimating = useSetAtom(isAnimatingAtom);
    const skipSignal = useAtomValue(skipAnimationSignalAtom);

    // Track the skipSignal counter at the start of the current cycle
    const [startSkipSignal, setStartSkipSignal] = useState(skipSignal);

    // Pure state comparison during render - fully compliant with React 19 / Compiler rules
    const isSkipped = skipSignal > startSkipSignal;

    // Split passage into individual paragraphs by double newlines
    const paragraphs = useMemo(() => passage.split(/\n\n/), []);

    // Split paragraphs evenly across left and right pages
    const leftParagraphCount = Math.ceil(paragraphs.length / 2);
    const leftPassageParagraphs = paragraphs.slice(0, leftParagraphCount);
    const rightPassageParagraphs = paragraphs.slice(leftParagraphCount);

    const leftPassageFull = leftPassageParagraphs.join("\n\n");

    // Handle character-by-character typewriter animation
    useEffect(() => {
        // If reduced motion is on or skipped, mark animation as finished
        if (prefersReducedMotion || isSkipped) {
            setIsAnimating(false);
            return;
        }

        setIsAnimating(true);

        let cancelled = false;
        let timeoutId = 0;
        let index = 0;

        const tick = () => {
            if (cancelled) return;

            index += 1;
            setRevealCount(index);

            if (index >= passage.length) {
                setIsAnimating(false);
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

        timeoutId = window.setTimeout(tick, LETTER_REVEAL_INITIAL_DELAY_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [cycle, prefersReducedMotion, isSkipped, setIsAnimating]);

    // Derived count: if reduced motion or skipped, show full text instantly
    const effectiveCount =
        prefersReducedMotion || isSkipped ? passage.length : revealCount;
    const revealedText = passage.slice(0, effectiveCount);

    // Slice cleanly between pages based on paragraph distribution
    const leftCharLimit = leftPassageFull.length;
    const leftRevealed = revealedText.slice(0, leftCharLimit);
    const rightRevealed = revealedText.slice(leftCharLimit);

    const leftDisplayedParagraphs = leftRevealed.split(/\n\n/);
    const rightDisplayedParagraphs = rightRevealed
        ? rightRevealed.split(/\n\n/)
        : [];

    const handleRefreshInk = () => {
        setStartSkipSignal(skipSignal);
        setRevealCount(0);
        setCycle((c) => c + 1);
    };

    return (
        <TomeLayout
            title={chapterTitle}
            headerLabel={chapterTitle}
            onRefreshInk={handleRefreshInk}
            leftPage={
                <div className="space-y-5">
                    <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[#8c7457]">
                        <span>{chapterTitle}</span>
                        <span className="h-px flex-1 bg-[#c2b293]/60" />
                    </div>
                    <div
                        className={`${bodyFont.className} space-y-4 text-[1.3rem] leading-[2.4rem] text-[#24170d]`}
                    >
                        {leftDisplayedParagraphs.map((para, idx) => (
                            <p key={idx}>{para}</p>
                        ))}
                    </div>
                </div>
            }
            rightPage={
                <div className="space-y-5">
                    <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[#8c7457]">
                        <span>{chapterTitle}</span>
                        <span className="h-px flex-1 bg-[#c2b293]/60" />
                    </div>
                    <motion.div
                        key={cycle}
                        className={`${bodyFont.className} space-y-4 text-[1.3rem] leading-[2.4rem] text-[#24170d]`}
                    >
                        {rightDisplayedParagraphs.map((para, idx) => (
                            <p key={idx}>{para}</p>
                        ))}
                    </motion.div>
                </div>
            }
        />
    );
}
