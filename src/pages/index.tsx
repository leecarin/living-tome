import Head from "next/head";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Cormorant_Garamond, Crimson_Text } from "next/font/google";
import {
    LETTER_REVEAL_BASE_DELAY_MS,
    LETTER_REVEAL_INITIAL_DELAY_MS,
    LETTER_REVEAL_LINE_BREAK_DELAY_MS,
    LETTER_REVEAL_PUNCTUATION_DELAY_MS,
} from "@/lib/chapterTiming";

const headingFont = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const bodyFont = Crimson_Text({
    subsets: ["latin"],
    weight: ["400", "600"],
});

const tomeScript =
    "You were not summoned by chance.\n\nBeneath the ruined watchtower, the floor is still warm where the oath was spoken.\n\nWhen the last candle gutters, the living ink will point toward the gate that should have stayed sealed.";

const clues = [
    "Track the three bells at dusk.",
    "Never read the final line aloud.",
    "Return the key to the ash circle.",
];

export default function Home() {
    const prefersReducedMotion = useReducedMotion();
    const [typedScript, setTypedScript] = useState("");
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let timeoutId = 0;
        let index = 0;

        const step = () => {
            if (cancelled) {
                return;
            }

            index += 1;
            setTypedScript(tomeScript.slice(0, index));

            if (index >= tomeScript.length) {
                return;
            }

            const currentChar = tomeScript[index - 1];
            const nextDelay =
                currentChar === "\n"
                    ? LETTER_REVEAL_LINE_BREAK_DELAY_MS
                    : /[.,;:!?]/.test(currentChar)
                      ? LETTER_REVEAL_PUNCTUATION_DELAY_MS
                      : LETTER_REVEAL_BASE_DELAY_MS;

            timeoutId = window.setTimeout(step, nextDelay);
        };

        const start = () => {
            if (cancelled) {
                return;
            }

            if (prefersReducedMotion) {
                setTypedScript(tomeScript);
                return;
            }

            setTypedScript("");
            timeoutId = window.setTimeout(step, LETTER_REVEAL_INITIAL_DELAY_MS);
        };

        timeoutId = window.setTimeout(start, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [cycle, prefersReducedMotion]);

    return (
        <>
            <Head>
                <title>The Living Tome</title>
                <meta
                    name="description"
                    content="An animated D&D tome page that writes itself with invisible ink."
                />
            </Head>

            <main
                className={`${bodyFont.className} relative min-h-screen overflow-hidden text-[var(--foreground)]`}
            >
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="absolute left-[-12%] top-[-16%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(214,153,83,0.28),transparent_68%)] blur-3xl"
                        animate={{
                            x: [0, 28, 0],
                            y: [0, 18, 0],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="absolute right-[-10%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(83,45,20,0.38),transparent_72%)] blur-3xl"
                        animate={{
                            x: [0, -24, 0],
                            y: [0, 20, 0],
                            scale: [1, 1.06, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="absolute inset-x-0 bottom-0 h-[45vh] bg-[linear-gradient(to_top,rgba(7,4,2,0.9),rgba(7,4,2,0.18),transparent)]"
                        animate={{ opacity: [0.66, 0.92, 0.66] }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </motion.div>

                <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-10">
                    <motion.section
                        className="relative mx-auto w-full max-w-6xl"
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 px-2 text-[0.7rem] uppercase tracking-[0.45em] text-[var(--foreground-soft)] sm:px-4">
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-[var(--ember)] shadow-[0_0_18px_rgba(232,162,85,0.95)]" />
                                <span>Archive VI</span>
                            </div>
                            <span>Open to reveal the chapter</span>
                        </div>

                        <motion.div
                            className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(95,58,30,0.85)] bg-[linear-gradient(180deg,rgba(43,23,12,0.98),rgba(21,11,6,0.98))] p-3 shadow-[0_48px_140px_rgba(0,0,0,0.66)] ring-1 ring-black/40 sm:p-4"
                            whileHover={
                                prefersReducedMotion
                                    ? undefined
                                    : { y: -3, scale: 1.005 }
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

                            <div className="absolute inset-x-0 top-0 h-8 bg-[linear-gradient(to_bottom,rgba(255,243,217,0.16),transparent)]" />

                            <div className="grid gap-0 overflow-hidden rounded-[1.8rem] border border-[rgba(255,240,206,0.12)] bg-[linear-gradient(180deg,rgba(80,52,29,0.18),rgba(35,21,12,0.08))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:grid-cols-[1fr_1fr]">
                                <motion.aside
                                    className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(244,227,194,0.98),rgba(227,201,158,0.97))] px-5 py-6 text-[var(--ink)] shadow-[inset_-14px_0_28px_rgba(116,74,35,0.12),inset_0_1px_0_rgba(255,255,255,0.55)] sm:px-8 sm:py-8"
                                    initial={{ opacity: 0, x: -18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.75, delay: 0.15 }}
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(90deg,rgba(111,74,34,0.08),transparent_10%,transparent_90%,rgba(111,74,34,0.06))] opacity-80" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-[linear-gradient(to_right,transparent,rgba(146,104,58,0.18))]" />
                                    <div className="relative flex h-full min-h-[31rem] flex-col justify-between gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.42em] text-[rgba(67,42,20,0.62)]">
                                                <span className="h-px flex-1 bg-[rgba(67,42,20,0.18)]" />
                                                Marginalia
                                            </div>
                                            <div className="space-y-4">
                                                <h1
                                                    className={`${headingFont.className} max-w-[10ch] text-5xl leading-[0.92] font-semibold tracking-tight sm:text-6xl lg:text-7xl`}
                                                >
                                                    The Living Tome
                                                </h1>
                                                <p className="max-w-[26rem] text-lg leading-8 text-[rgba(41,22,11,0.84)] sm:text-xl">
                                                    An open book that writes
                                                    itself in the hush between
                                                    torchlight and thunder,
                                                    ready for the next D&D
                                                    descent into the unknown.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-[rgba(67,42,20,0.16)] pt-6">
                                            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.35em] text-[rgba(67,42,20,0.64)]">
                                                <span className="h-px flex-1 bg-[rgba(67,42,20,0.18)]" />
                                                Field notes
                                            </div>
                                            <ul className="space-y-3">
                                                {clues.map(
                                                    (clue, clueIndex) => (
                                                        <motion.li
                                                            key={clue}
                                                            className="flex items-start gap-3 text-base leading-7 text-[rgba(42,22,11,0.9)]"
                                                            initial={{
                                                                opacity: 0,
                                                                x: -8,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    0.35 +
                                                                    clueIndex *
                                                                        0.12,
                                                            }}
                                                        >
                                                            <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(69,41,18,0.56)] shadow-[0_0_0_3px_rgba(69,41,18,0.08)]" />
                                                            <span>{clue}</span>
                                                        </motion.li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.aside>

                                <motion.section
                                    className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(241,226,190,0.98),rgba(226,201,156,0.98))] px-5 py-6 text-[var(--ink)] shadow-[inset_14px_0_28px_rgba(116,74,35,0.1),inset_0_1px_0_rgba(255,255,255,0.54)] sm:px-8 sm:py-8"
                                    initial={{ opacity: 0, x: 18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.18 }}
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(90deg,rgba(111,74,34,0.06),transparent_12%,transparent_88%,rgba(111,74,34,0.08))] opacity-80" />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-[linear-gradient(to_left,transparent,rgba(146,104,58,0.16))]" />
                                    <div className="relative flex min-h-[31rem] flex-col">
                                        <div className="mb-6 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[0.68rem] uppercase tracking-[0.42em] text-[rgba(67,42,20,0.6)]">
                                                    Chapter IV
                                                </p>
                                                <h2
                                                    className={`${headingFont.className} mt-2 text-4xl font-semibold tracking-tight sm:text-5xl`}
                                                >
                                                    The page remembers.
                                                </h2>
                                            </div>

                                            <motion.button
                                                type="button"
                                                className="rounded-full border border-[rgba(67,42,20,0.18)] bg-[rgba(255,252,246,0.78)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-[rgba(50,30,16,0.82)] shadow-[0_8px_24px_rgba(73,41,18,0.12)] backdrop-blur-sm transition-colors hover:bg-[rgba(255,255,255,0.92)]"
                                                onClick={() =>
                                                    setCycle(
                                                        (value) => value + 1,
                                                    )
                                                }
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
                                        </div>

                                        <div className="relative flex flex-1 flex-col justify-between gap-8">
                                            <div className="space-y-6 text-xl leading-9 tracking-[0.01em] text-[rgba(41,22,11,0.92)] sm:text-[1.35rem] sm:leading-[2.4rem]">
                                                <motion.p
                                                    key={cycle}
                                                    className="max-w-[32rem] whitespace-pre-line"
                                                    initial={{ opacity: 0.92 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                >
                                                    {typedScript}
                                                </motion.p>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(67,42,20,0.14)] pt-5 text-[0.78rem] uppercase tracking-[0.32em] text-[rgba(67,42,20,0.55)]">
                                                <span>
                                                    Speak softly. The page is
                                                    listening.
                                                </span>
                                                <span>
                                                    Touch the button to restart
                                                    the spell.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            </div>
                        </motion.div>
                    </motion.section>
                </div>
            </main>
        </>
    );
}
