import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";
import { useAtomValue } from "jotai";
import useSWR from "swr";

import { authAtom } from "@/store/auth";
import { logoutUser } from "@/lib/firebase/auth";
import {
    getOriginalChapters,
    getUserChapters,
} from "@/lib/firebase/db/firestore";
import {
    serializeChapter,
    type SerializedChapter,
} from "@/lib/firebase/db/serialize";

// Static fallback / primary routes that should always exist
const staticOriginalChapters = [
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

async function fetchOriginalChapters() {
    const docs = await getOriginalChapters();
    return docs.filter((doc) => !doc.is_hidden).map(serializeChapter);
}

async function fetchUserChapters([, uid]: [string, string]) {
    if (!uid) return [];
    const docs = await getUserChapters(uid);
    return docs.filter((doc) => !doc.is_hidden).map(serializeChapter);
}

export default function ChapterShell({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Dropdown toggle states
    const [isOriginalOpen, setIsOriginalOpen] = useState(true);
    const [isCustomOpen, setIsCustomOpen] = useState(true);

    const { user } = useAtomValue(authAtom);

    // Fetch original read-only chapters
    const { data: originalChapters = [] } = useSWR<SerializedChapter[]>(
        "original-chapters-list",
        fetchOriginalChapters,
    );

    // Fetch logged-in user's custom chapters
    const { data: customChapters = [] } = useSWR<SerializedChapter[]>(
        user ? ["user-chapters-list", user.uid] : null,
        fetchUserChapters,
    );

    const handleLogout = async () => {
        try {
            await logoutUser();
            router.push("/auth");
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    // Combine static original routes with dynamic ones from Firestore slug routing
    const allOriginals = [
        ...staticOriginalChapters,
        ...originalChapters
            .filter((ch) => ch.slug !== "last-dusk" && ch.slug !== "epilogue")
            .map((ch, idx) => ({
                href: `/${ch.slug}`,
                label: ch.title,
                code: `O-${idx + 1}`,
                category: `Chapter ${ch.chapter_order}`,
            })),
    ];

    const allCustoms = customChapters.map((ch, idx) => ({
        href: `/u/${user?.uid}/${ch.slug}`,
        label: ch.title,
        code: `C-${idx + 1}`,
        category: `Chapter ${ch.chapter_order}`,
    }));

    const renderChapterLink = (item: {
        href: string;
        label: string;
        code: string;
        category: string;
    }) => {
        const isActive = router.asPath === item.href;

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
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
                {isActive && (
                    <span className="shadow-bookmark-glow absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-blood" />
                )}

                {isCollapsed ? (
                    <span className="font-serif text-lg">{item.code}</span>
                ) : (
                    <div className="min-w-0 flex-1">
                        <span
                            className={`block text-[0.68rem] font-medium uppercase tracking-[0.38em] transition-colors ${
                                isActive
                                    ? "text-moonlight"
                                    : "text-mist group-hover:text-moonlight"
                            }`}
                        >
                            {item.category}
                        </span>
                        <span className="mt-0.5 block truncate text-base font-medium leading-6">
                            {item.label}
                        </span>
                    </div>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen lg:flex">
            {/* Mobile Header Bar */}
            <div className="flex items-center justify-between border-b border-blood/20 bg-slate-950/98 px-4 py-3 text-foreground lg:hidden">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blood shadow-dot-glow" />
                    <span className="font-serif font-semibold tracking-wide">
                        <Link href="/">The Living Tome</Link>
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
                                <Link href={"/"}>
                                    <h1 className="whitespace-nowrap font-serif text-2xl leading-tight text-foreground">
                                        The Living Tome
                                    </h1>
                                </Link>
                                <p className="max-w-[15rem] text-sm leading-6 text-foreground-soft">
                                    Turn the leaves to step between chapters.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Container */}
                    <nav
                        aria-label="Chapter navigation"
                        className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1"
                    >
                        {/* 1. Original / Read-Only Dropdown */}
                        <div className="flex flex-col gap-2">
                            {!isCollapsed ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsOriginalOpen((prev) => !prev)
                                    }
                                    className="flex items-center justify-between px-1 text-[0.85rem] font-semibold uppercase tracking-[0.25em] text-mist hover:text-moonlight"
                                >
                                    <span>Tome of Strahd</span>
                                    <svg
                                        className={`h-3.5 w-3.5 transform transition-transform ${
                                            isOriginalOpen ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                            ) : null}

                            {(isOriginalOpen || isCollapsed) && (
                                <div className="flex flex-col gap-2">
                                    {allOriginals.map(renderChapterLink)}
                                </div>
                            )}
                        </div>

                        {/* 2. Custom User Content Dropdown (Logged in only) */}
                        {user && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-blood/10">
                                {!isCollapsed ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsCustomOpen((prev) => !prev)
                                        }
                                        className="flex items-center justify-between px-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-mist hover:text-moonlight"
                                    >
                                        <span>Custom Chapters</span>
                                        <svg
                                            className={`h-3.5 w-3.5 transform transition-transform ${
                                                isCustomOpen ? "rotate-180" : ""
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                ) : null}

                                {(isCustomOpen || isCollapsed) && (
                                    <div className="flex flex-col gap-2">
                                        {allCustoms.length > 0 ? (
                                            allCustoms.map(renderChapterLink)
                                        ) : !isCollapsed ? (
                                            <p className="px-2 text-xs italic text-foreground-soft/60">
                                                No custom leaves recorded.
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>

                    {/* Collapsed View User Actions */}
                    {isCollapsed && user && (
                        <div className="mt-auto flex flex-col items-center gap-2">
                            <Link
                                href="/admin"
                                title="Admin Dashboard"
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                                    router.pathname === "/admin"
                                        ? "border-mist/70 bg-mist/20 text-moonlight"
                                        : "border-foreground/10 bg-white/[0.04] text-foreground-soft hover:border-mist/40 hover:bg-mist/10 hover:text-foreground"
                                }`}
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </Link>
                        </div>
                    )}

                    {/* Footer Callout */}
                    {!isCollapsed && (
                        <div className="mt-auto hidden rounded-2xl border border-mist/20 bg-mist/[0.09] p-4 lg:block">
                            <span className="whitespace-nowrap text-[0.8rem] font-medium uppercase tracking-[0.3em] text-blood-light/80">
                                Keeper Access
                            </span>

                            {user ? (
                                <div className="mt-2 space-y-1.5">
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium leading-6 transition-colors tracking-widest ${
                                            router.pathname === "/admin"
                                                ? "bg-mist/50 text-moonlight border border-mist"
                                                : "text-foreground-soft bg-mist/30 hover:bg-mist/50 hover:text-foreground"
                                        }`}
                                    >
                                        Admin Dashboard
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="block w-full rounded-lg bg-ember/50 px-2 py-1.5 text-left text-sm font-medium leading-6 tracking-widest text-foreground-soft transition-colors hover:bg-ember/60 hover:text-foreground"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="mt-1 block rounded-lg px-2 py-1.5 text-[1rem] leading-6 text-foreground-soft transition-colors hover:bg-moonlight/10 hover:text-foreground"
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
