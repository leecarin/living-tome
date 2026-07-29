import { useEffect, useState, useCallback } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { isAnimatingAtom, skipAnimationSignalAtom } from "@/store/animation";
import { useReducedMotion } from "motion/react";
import {
    LETTER_REVEAL_BASE_DELAY_MS,
    LETTER_REVEAL_INITIAL_DELAY_MS,
    LETTER_REVEAL_LINE_BREAK_DELAY_MS,
    LETTER_REVEAL_PUNCTUATION_DELAY_MS,
} from "@/lib/chapterTiming";

export function useTomeTiming(passageText: string) {
    const prefersReducedMotion = useReducedMotion();
    const [revealCount, setRevealCount] = useState(0);
    const [cycle, setCycle] = useState(0);

    const setIsAnimating = useSetAtom(isAnimatingAtom);
    const skipSignal = useAtomValue(skipAnimationSignalAtom);

    const [startSkipSignal, setStartSkipSignal] = useState(skipSignal);
    const isSkipped = skipSignal > startSkipSignal;

    useEffect(() => {
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

            if (index >= passageText.length) {
                setIsAnimating(false);
                return;
            }

            const currentChar = passageText[index - 1];
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
    }, [cycle, passageText, prefersReducedMotion, isSkipped, setIsAnimating]);

    const handleRefreshInk = useCallback(() => {
        setStartSkipSignal(skipSignal);
        setRevealCount(0);
        setCycle((c) => c + 1);
    }, [skipSignal]);

    const effectiveCount =
        prefersReducedMotion || isSkipped ? passageText.length : revealCount;

    return {
        revealedCount: effectiveCount,
        cycle,
        handleRefreshInk,
    };
}
