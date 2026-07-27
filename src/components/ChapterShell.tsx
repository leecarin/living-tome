import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const chapters = [
    { href: "/", label: "Home Page" },
    { href: "/last-dusk", label: "The Fall of the Dusk Elves" },
    { href: "/epilogue", label: "Epilogue" },
];

export default function ChapterShell({ children }: { children: ReactNode }) {
    const router = useRouter();

    return (
        <div className="min-h-screen lg:flex">
            {/* Sidebar Shell with subtle crimson edge glow */}
            <aside className="relative border-b border-blood/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(10,15,26,0.98))] px-4 py-5 text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.5)] lg:sticky lg:top-0 lg:h-screen lg:w-[18rem] lg:border-b-0 lg:border-r lg:border-blood/25 lg:px-5 lg:py-7">
                {/* Top Subtle Red Accent Line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blood/40 to-transparent" />

                <div className="flex h-full flex-col gap-6">
                    {/* Header Section */}
                    <div className="space-y-2 border-b border-blood/20 pb-4">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blood shadow-[0_0_8px_var(--blood)]" />
                            <p className="text-[0.68rem] font-medium uppercase tracking-[0.5em] text-blood-light/80">
                                Chapter Index
                            </p>
                        </div>
                        <h1 className="font-[var(--font-body,Georgia)] text-2xl leading-tight text-foreground">
                            The Living Tome
                        </h1>
                        <p className="max-w-[15rem] text-sm leading-6 text-foreground-soft">
                            Turn the leaves to step between chapters.
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav
                        aria-label="Chapter navigation"
                        className="flex flex-col gap-2.5"
                    >
                        {chapters.map((chapter) => {
                            const isActive = router.pathname === chapter.href;

                            return (
                                <Link
                                    key={chapter.href}
                                    href={chapter.href}
                                    className={`group relative rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
                                        isActive
                                            ? "border-blood/70 bg-blood/20 text-foreground shadow-[0_4px_20px_rgba(136,19,55,0.35),inset_0_0_0_1px_rgba(225,29,72,0.2)]"
                                            : "border-foreground/10 bg-white/[0.04] text-foreground-soft hover:border-blood/40 hover:bg-blood/10 hover:text-foreground"
                                    }`}
                                >
                                    {/* Active Left Bookmark Indicator Strip */}
                                    {isActive && (
                                        <span className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-ember shadow-[0_0_8px_var(--ember)]" />
                                    )}

                                    <span
                                        className={`block text-[0.68rem] font-medium uppercase tracking-[0.38em] transition-colors ${
                                            isActive
                                                ? "text-ember"
                                                : "text-foreground-soft group-hover:text-ember"
                                        }`}
                                    >
                                        {chapter.href === "/"
                                            ? "Front leaf"
                                            : "Distant leaf"}
                                    </span>
                                    <span className="mt-1 block text-base leading-6 font-medium">
                                        {chapter.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Callout */}
                    <div className="mt-auto hidden rounded-2xl border border-blood/20 bg-blood/[0.06] px-4 py-4 text-sm leading-6 text-foreground-soft lg:block">
                        <span className="block text-xs font-semibold uppercase tracking-widest text-blood-light/70">
                            Bound in Blood
                        </span>
                        A quiet shelf of chapters waits here, bound in slate and
                        memory.
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
