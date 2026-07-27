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
            <aside className="border-b border-foreground/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(10,15,26,0.98))] px-4 py-5 text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.5)] lg:sticky lg:top-0 lg:h-screen lg:w-[18rem] lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
                <div className="flex h-full flex-col gap-6">
                    <div className="space-y-2 border-b border-foreground/15 pb-4">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.5em] text-foreground-soft">
                            Chapter Index
                        </p>
                        <h1 className="font-[var(--font-body,Georgia)] text-2xl leading-tight text-foreground">
                            The Living Tome
                        </h1>
                        <p className="max-w-[15rem] text-sm leading-6 text-foreground-soft">
                            Turn the leaves to step between chapters.
                        </p>
                    </div>

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
                                    className={`group rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
                                        isActive
                                            ? "border-ember/70 bg-ember/25 text-foreground shadow-[0_4px_16px_rgba(143,38,51,0.25),inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                                            : "border-foreground/15 bg-white/[0.06] text-foreground-soft hover:border-foreground/30 hover:bg-white/[0.1] hover:text-foreground"
                                    }`}
                                >
                                    <span className="block text-[0.68rem] font-medium uppercase tracking-[0.38em] text-foreground-soft group-hover:text-foreground">
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

                    <div className="mt-auto hidden rounded-2xl border border-foreground/15 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-foreground-soft lg:block">
                        A quiet shelf of chapters waits here, bound in slate and
                        memory.
                    </div>
                </div>
            </aside>

            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
