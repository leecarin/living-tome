import Head from "next/head";
import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import SkipAnimationButton from "@/components/ui/SkipAnimationButton";

interface TomeLayoutProps {
    title: string;
    description?: string;
    headerLabel: string;
    leftPage: ReactNode;
    rightPage: ReactNode;
    onRefreshInk?: () => void;
}

export default function TomeLayout({
    title,
    description = "An interactive tome page.",
    headerLabel,
    leftPage,
    rightPage,
    onRefreshInk,
}: TomeLayoutProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <>
            <Head>
                <title>{title} | The Living Tome</title>
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
                            {/* Unveil Full Page Button */}
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
                            <div className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,var(--page-top),var(--page-bottom-left))] px-5 py-6 text-ink shadow-[inset_-14px_0_28px_rgba(72,52,32,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-8 sm:py-8">
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-[linear-gradient(to_right,transparent,rgba(70,48,22,0.12))]" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    {leftPage}
                                </div>
                            </div>

                            {/* Right Page Surface */}
                            <div className="relative min-h-[31rem] overflow-hidden bg-[linear-gradient(180deg,var(--page-top),var(--page-bottom-right))] px-5 py-6 text-ink shadow-[inset_14px_0_28px_rgba(72,52,32,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-8 sm:py-8">
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-[linear-gradient(to_left,transparent,rgba(70,48,22,0.12))]" />
                                <div className="relative flex h-full flex-col justify-between gap-8">
                                    {rightPage}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            </main>
        </>
    );
}
