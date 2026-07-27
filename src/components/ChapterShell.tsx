import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const chapters = [
    { href: "/", label: "Home Page" },
    { href: "/epilogue", label: "Epilogue" },
];

export default function ChapterShell({ children }: { children: ReactNode }) {
    const router = useRouter();

    return (
        <div className="min-h-screen lg:flex">
            <aside className="border-b border-[rgba(255,235,205,0.08)] bg-[linear-gradient(180deg,rgba(27,15,8,0.98),rgba(18,10,6,0.98))] px-4 py-5 text-[var(--foreground)] shadow-[0_18px_50px_rgba(0,0,0,0.3)] lg:sticky lg:top-0 lg:h-screen lg:w-[18rem] lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
                <div className="flex h-full flex-col gap-6">
                    <div className="space-y-2 border-b border-[rgba(255,235,205,0.08)] pb-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.5em] text-[var(--foreground-soft)]">
                            Chapter Index
                        </p>
                        <h1 className="font-[var(--font-body,Georgia)] text-2xl leading-tight text-[var(--foreground)]">
                            The Living Tome
                        </h1>
                        <p className="max-w-[15rem] text-sm leading-6 text-[rgba(244,231,204,0.72)]">
                            Turn the leaves to step between chapters.
                        </p>
                    </div>

                    <nav
                        aria-label="Chapter navigation"
                        className="flex flex-col gap-2"
                    >
                        {chapters.map((chapter) => {
                            const isActive = router.pathname === chapter.href;

                            return (
                                <Link
                                    key={chapter.href}
                                    href={chapter.href}
                                    className={`group rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                                        isActive
                                            ? "border-[rgba(230,161,74,0.5)] bg-[rgba(230,161,74,0.12)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(230,161,74,0.18)]"
                                            : "border-transparent bg-[rgba(255,255,255,0.02)] text-[rgba(244,231,204,0.7)] hover:border-[rgba(255,235,205,0.1)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--foreground)]"
                                    }`}
                                >
                                    <span className="block text-[0.68rem] uppercase tracking-[0.38em] text-[rgba(244,231,204,0.55)] group-hover:text-[rgba(244,231,204,0.72)]">
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

                    <div className="mt-auto hidden rounded-2xl border border-[rgba(255,235,205,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-4 text-sm leading-6 text-[rgba(244,231,204,0.72)] lg:block">
                        A quiet shelf of chapters waits here, bound in leather
                        and memory.
                    </div>
                </div>
            </aside>

            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
