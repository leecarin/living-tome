import Head from "next/head";
import { useState } from "react";
import { motion, useReducedMotion, Variants } from "motion/react";
import { cormorant, crimsonText } from "@/config/nextFonts";
import Link from "next/link";
import Image from "next/image";

const headingFont = cormorant;
const bodyFont = crimsonText;

const tomeScript = [
    "The Living Tome is a digital companion for Dungeon Masters running Curse of Strahd and the Interactive Tome of Strahd mod.",
    "It gives you a book-like interface to present campaign lore to your players, replacing static PDF handouts with something you can update mid-campaign.",
    "Create, edit, hide, or reveal chapters as your party uncovers Barovia's history, then share a link so your players can read along.",
];

const features = [
    "Author custom chapters from your DM dashboard",
    "Publish a shareable link for your players to read",
    "Reveal or hide chapters as your campaign unfolds",
];

// Fade in animation constants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.6,
            delayChildren: 0.25,
        },
    },
};

const paragraphVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 2.0,
            ease: [0.22, 1, 0.36, 1], // cubic bezier tuple for "fade in" effect
        },
    },
};

export default function Home() {
    const prefersReducedMotion = useReducedMotion();
    const [cycle, setCycle] = useState(0);

    return (
        <>
            <Head>
                <title>The Living Tome</title>
                <meta
                    name="description"
                    content="A digital companion for Dungeon Masters running Curse of Strahd — publish and share custom campaign chapters with your players."
                />
            </Head>

            <main
                className={`${bodyFont.className} relative min-h-screen overflow-hidden text-foreground`}
            >
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="absolute left-[-12%] top-[-16%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.18),transparent_68%)] blur-3xl"
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
                        className="absolute right-[-10%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(51,65,85,0.38),transparent_72%)] blur-3xl"
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
                        className="absolute inset-x-0 bottom-0 h-[45vh] bg-[linear-gradient(to_top,rgba(5,7,12,0.9),rgba(5,7,12,0.18),transparent)]"
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
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 px-2 text-[0.7rem] uppercase tracking-[0.45em] text-foreground-soft sm:px-4">
                            <div className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full red-dot-glow" />
                                <span>Curse of Strahd Digital Companion</span>
                            </div>
                            <span>
                                <a
                                    href="https://github.com/leecarin/living-tome"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors hover:text-foreground"
                                    aria-label="View repository on Github"
                                >
                                    <Image
                                        src="/github-logo-white.svg"
                                        alt="Github Logo"
                                        width={22}
                                        height={22}
                                        aria-hidden="true"
                                    />
                                </a>
                            </span>
                        </div>

                        {/* Outer Dark Cover */}
                        <motion.div
                            className="relative overflow-hidden rounded-[2.4rem] border border-slate-700/80 bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(15,23,42,0.98))] p-3 shadow-[0_48px_140px_rgba(0,0,0,0.7)] ring-1 ring-black/50 sm:p-4"
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
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)]" />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.08),transparent_16%,transparent_84%,rgba(0,0,0,0.15))]" />
                            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-[linear-gradient(to_right,rgba(30,41,59,0.95),rgba(15,23,42,0.92),rgba(30,41,59,0.95))] shadow-[0_0_28px_rgba(0,0,0,0.5)]" />
                            <div className="pointer-events-none absolute inset-y-3 left-1/2 w-[1px] -translate-x-1/2 bg-[rgba(226,232,240,0.18)]" />

                            {/* Inner Parchment Pages bound by CSS color variables */}
                            <div className="grid gap-0 overflow-hidden rounded-[1.8rem] border border-[#c2b08d]/80 bg-[var(--page-base)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] lg:grid-cols-[1fr_1fr]">
                                {/* Left Page */}
                                <motion.aside
                                    className="relative overflow-hidden bg-[linear-gradient(180deg,var(--page-top),var(--page-bottom-left))] px-5 py-6 text-ink shadow-[inset_-14px_0_28px_rgba(72,52,32,0.12),inset_0_1px_0_rgba(255,255,255,0.4)] sm:px-8 sm:py-8"
                                    initial={{ opacity: 0, x: -18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.15 }}
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.25),transparent_26%),linear-gradient(90deg,rgba(70,48,22,0.06),transparent_10%,transparent_90%,rgba(70,48,22,0.05))] opacity-80" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-[linear-gradient(to_right,transparent,rgba(40,28,12,0.15))]" />
                                    <div className="relative flex h-full min-h-[31rem] flex-col justify-between gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.42em] text-[#8c7457]">
                                                <span className="h-px flex-1 bg-[#b5a382]" />
                                                What This Is
                                            </div>
                                            <div className="space-y-4">
                                                <h1
                                                    className={`${headingFont.className} max-w-[10ch] text-5xl leading-[0.92] font-semibold tracking-tight text-ink sm:text-6xl lg:text-6xl`}
                                                >
                                                    The Living Tome
                                                </h1>
                                                <p className="max-w-[26rem] text-l leading-8 text-ink/85 sm:text-xl">
                                                    A digital companion for
                                                    Dungeon Masters running the{" "}
                                                    <span>
                                                        <a href="https://www.dmsguild.com/en/product/301867/the-interactive-tome-of-strahd">
                                                            Interactive Curse of
                                                            Strahd
                                                        </a>
                                                    </span>{" "}
                                                    mod by The Aciduous
                                                    Adventurer, built to replace
                                                    static handouts with
                                                    chapters you can update as
                                                    your campaign evolves.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-[#c2b08d]/80 pt-6">
                                            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.35em] text-[#8c7457]">
                                                <span className="h-px flex-1 bg-[#b5a382]" />
                                                What You Can Do
                                            </div>
                                            <ul className="space-y-3">
                                                {features.map(
                                                    (feature, clueIndex) => (
                                                        <motion.li
                                                            key={feature}
                                                            className="flex items-start gap-3 text-base leading-7 text-[#4a3828]"
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
                                                            <span className="mt-2 h-2 w-2 rounded-full bg-[var(--blood)] shadow-[0_0_0_3px_rgba(136,19,55,0.2)]" />
                                                            <span>
                                                                {feature}
                                                            </span>
                                                        </motion.li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.aside>

                                {/* Right Page */}
                                <motion.section
                                    className="relative overflow-hidden bg-[linear-gradient(180deg,var(--page-top),var(--page-bottom-right))] px-5 py-6 text-ink shadow-[inset_14px_0_28px_rgba(72,52,32,0.12),inset_0_1px_0_rgba(255,255,255,0.4)] sm:px-8 sm:py-8"
                                    initial={{ opacity: 0, x: 18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.35, delay: 0.18 }}
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.2),transparent_24%),linear-gradient(90deg,rgba(70,48,22,0.05),transparent_12%,transparent_88%,rgba(70,48,22,0.07))] opacity-80" />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-[linear-gradient(to_left,transparent,rgba(40,28,12,0.15))]" />
                                    <div className="relative flex min-h-[31rem] flex-col">
                                        <div className="mb-6 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[0.68rem] uppercase tracking-[0.42em] text-[#8c7457]">
                                                    Get Started
                                                </p>
                                                <h2
                                                    className={`${headingFont.className} mt-2 text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl`}
                                                >
                                                    Built for your table.
                                                </h2>
                                            </div>

                                            <motion.button
                                                type="button"
                                                className="btn-parchment"
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
                                                <span>Restart</span>
                                                <span>Animation</span>
                                            </motion.button>
                                        </div>

                                        <div className="relative flex flex-1 flex-col justify-between gap-8">
                                            <motion.div
                                                key={cycle}
                                                className="space-y-4 text-l leading-9 tracking-[0.01em] text-ink/85 sm:text-[1.2rem] sm:leading-[1.8rem]"
                                                variants={containerVariants}
                                                initial={
                                                    prefersReducedMotion
                                                        ? "show"
                                                        : "hidden"
                                                }
                                                animate="show"
                                            >
                                                {tomeScript.map(
                                                    (paragraph, idx) => (
                                                        <motion.p
                                                            key={idx}
                                                            className="max-w-[32rem]"
                                                            variants={
                                                                paragraphVariants
                                                            }
                                                        >
                                                            {paragraph}
                                                        </motion.p>
                                                    ),
                                                )}
                                            </motion.div>

                                            <div className="flex flex-wrap items-center gap-4 text-[0.78rem] uppercase tracking-[0.32em] text-[#8c7457]">
                                                <Link
                                                    href="/auth"
                                                    className="btn-parchment"
                                                >
                                                    <span>Create</span>
                                                    <span>Account</span>
                                                </Link>
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
