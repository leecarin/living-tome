import { useEffect, useState, useMemo } from "react";
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

export default function LastDuskPage() {
    const prefersReducedMotion = useReducedMotion();
    const [revealCount, setRevealCount] = useState(0);
    const [cycle, setCycle] = useState(0);

    // Split passage into individual paragraphs by double newlines
    const paragraphs = useMemo(() => passage.split(/\n\n/), []);

    // Decide how many paragraphs fit on the left page (e.g., roughly half of them)
    const leftParagraphCount = Math.ceil(paragraphs.length / 2);

    const leftPassageParagraphs = paragraphs.slice(0, leftParagraphCount);
    const rightPassageParagraphs = paragraphs.slice(leftParagraphCount);

    const leftPassageFull = leftPassageParagraphs.join("\n\n");
    const rightPassageFull = rightPassageParagraphs.join("\n\n");

    useEffect(() => {
        if (prefersReducedMotion) return;

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

        timeoutId = window.setTimeout(tick, LETTER_REVEAL_INITIAL_DELAY_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [cycle, prefersReducedMotion]);

    const effectiveCount = prefersReducedMotion ? passage.length : revealCount;

    // Slice the revealed text up to the current animation counter
    const revealedText = passage.slice(0, effectiveCount);

    // Split the currently revealed text between left and right based on character lengths
    const leftCharLimit = leftPassageFull.length;
    const leftRevealed = revealedText.slice(0, leftCharLimit);
    const rightRevealed = revealedText.slice(leftCharLimit);

    // Convert revealed chunks back into arrays of paragraphs for proper multi-paragraph rendering
    const leftDisplayedParagraphs = leftRevealed.split(/\n\n/);
    const rightDisplayedParagraphs = rightRevealed
        ? rightRevealed.split(/\n\n/)
        : [];

    const handleRefreshInk = () => {
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
                    {/* Page Header with Inline Horizontal Line */}
                    <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[#8c7457]">
                        <span>{chapterTitle}</span>
                        <span className="h-px flex-1 bg-[#c2b293]/60" />
                    </div>

                    {/* Page Body Text */}
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
                    {/* Page Header with Inline Horizontal Line */}
                    <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.4em] text-[#8c7457]">
                        <span>{chapterTitle}</span>
                        <span className="h-px flex-1 bg-[#c2b293]/60" />
                    </div>

                    {/* Page Body Text */}
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
