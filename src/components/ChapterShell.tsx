import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { authAtom } from "@/store/auth";
import { logoutUser } from "@/lib/firebase/auth";

const chapters = [
    { href: "/", label: "Home Page", code: "I", category: "Front leaf" },
    {
        href: "/last-dusk",
        label: "The Fall of the Dusk Elves",
        code: "II",
        category: "Distant leaf",
    },
    {
        href: "/epilogue",
        label: "Epilogue",
        code: "III",
        category: "Distant leaf",
    },
];

export default function ChapterShell({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const { user } = useAtomValue(authAtom);

    const handleLogout = async () => {
        try {
            await logoutUser();
            router.push("/auth");
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    return (
        <div className="min-h-screen lg:flex">
            {/* Mobile Header Bar */}
            <div className="flex items-center justify-between border-b border-blood/20 bg-slate-950/98 px-4 py-3 text-foreground lg:hidden">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blood shadow-dot-glow" />
                    <span className="font-serif font-semibold tracking-wide">
                        The Living Tome
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsMobileOpen((prev) => !prev)}
                    className="rounded-xl border-2 border-mist/30 bg-mist/30 px-3 py-1.5 text-xs uppercase tracking-widest text-moonlight hover:bg-moonlight/30"
                    aria-label="Toggle Navigation"
                >
                    {isMobileOpen ? "Close Index" : "Chapter Index"}
                </button>
            </div>

            {/* Sidebar Shell */}
            <aside
                className={`relative flex-col border-b border-mist/20 bg-gradient-to-b from-slate-900/98 to-slate-950/98 text-foreground shadow-2xl transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:flex lg:h-screen lg:border-b-0 lg:border-r lg:border-mist/25 ${
                    isMobileOpen ? "flex px-4 py-5" : "hidden lg:flex"
                } ${
                    isCollapsed
                        ? "lg:w-[5rem] lg:px-3 lg:py-6"
                        : "lg:w-[18rem] lg:px-5 lg:py-7"
                }`}
            >
                {/* Top Red Accent Divider */}
                <div
                    aria-hidden="true"
                    className="bg-crimson-divider mb-4 h-[2px] w-full"
                />

                <div className="flex h-full flex-col gap-6 overflow-hidden">
                    {/* Header Section */}
                    <div className="relative border-b border-blood/20 pb-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blood shadow-dot-glow" />
                                {!isCollapsed && (
                                    <p className="whitespace-nowrap text-[0.68rem] font-medium uppercase tracking-[0.5em] text-blood-light/80">
                                        Chapter Index
                                    </p>
                                )}
                            </div>

                            {/* Desktop Collapse Toggle */}
                            <button
                                type="button"
                                onClick={() => setIsCollapsed((prev) => !prev)}
                                className="hidden rounded-lg border border-blood/20 bg-white/[0.04] p-1.5 text-xs text-foreground-soft transition-colors hover:border-mist/50 hover:bg-mist/10 hover:text-moonlight lg:block"
                                title={
                                    isCollapsed
                                        ? "Expand Sidebar"
                                        : "Collapse Sidebar"
                                }
                                aria-label={
                                    isCollapsed
                                        ? "Expand Sidebar"
                                        : "Collapse Sidebar"
                                }
                            >
                                <svg
                                    className={`h-4 w-4 transform transition-transform duration-300 ${
                                        isCollapsed ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                        </div>

                        {!isCollapsed && (
                            <div className="mt-2 space-y-1">
                                <h1 className="whitespace-nowrap font-serif text-2xl leading-tight text-foreground">
                                    The Living Tome
                                </h1>
                                <p className="max-w-[15rem] text-sm leading-6 text-foreground-soft">
                                    Turn the leaves to step between chapters.
                                </p>
                            </div>
                        )}
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
                                    onClick={() => setIsMobileOpen(false)}
                                    title={
                                        isCollapsed ? chapter.label : undefined
                                    }
                                    className={`group relative flex items-center gap-3 rounded-2xl border transition-all duration-200 ${
                                        isCollapsed
                                            ? "justify-center px-2 py-3.5"
                                            : "px-4 py-3.5 text-left"
                                    } ${
                                        isActive
                                            ? "border-mist/70 bg-mist/20 text-foreground shadow-chapter-active"
                                            : "border-foreground/10 bg-white/[0.04] text-foreground-soft hover:border-mist/40 hover:bg-mist/10 hover:text-foreground"
                                    }`}
                                >
                                    {/* Active Left Bookmark Strip */}
                                    {isActive && (
                                        <span className="shadow-bookmark-glow absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-blood" />
                                    )}

                                    {/* Icon Indicator when collapsed */}
                                    {isCollapsed ? (
                                        <span className="text-lg font-serif">
                                            {chapter.code}
                                        </span>
                                    ) : (
                                        <div className="min-w-0 flex-1">
                                            <span
                                                className={`block text-[0.68rem] font-medium uppercase tracking-[0.38em] transition-colors ${
                                                    isActive
                                                        ? "text-moonlight"
                                                        : "text-mist group-hover:text-moonlight"
                                                }`}
                                            >
                                                {chapter.category}
                                            </span>
                                            <span className="mt-0.5 block truncate text-base font-medium leading-6">
                                                {chapter.label}
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Callout */}
                    {!isCollapsed && (
                        <div className="mt-auto hidden rounded-2xl border border-mist/20 bg-mist/[0.09] p-4 lg:block">
                            <span className="whitespace-nowrap text-[0.68rem] font-medium uppercase tracking-[0.5em] text-blood-light/80">
                                Keeper Access
                            </span>

                            {user ? (
                                <div className="mt-2 space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="block w-full tracking-widest rounded-lg bg-moonlight/10 px-2 py-1.5 text-left text-sm font-medium leading-6 text-foreground-soft transition-colors hover:bg-mist/30 hover:text-foreground"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="mt-1 block rounded-lg px-2 py-1.5 text-sm leading-6 text-foreground-soft transition-colors hover:bg-moonlight/10 hover:text-foreground"
                                >
                                    Enter the Scriptorium →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
