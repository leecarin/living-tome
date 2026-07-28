import { useState } from "react";
import Link from "next/link";

interface PageLeaf {
    id: string;
    title: string;
    slug: string;
    category: string;
    isPublic: boolean;
    updatedAt: string;
}

// Temporary mock data reflecting user-owned chapters
const MOCK_LEAVES: PageLeaf[] = [
    {
        id: "1",
        title: "The Fall of the Dusk Elves",
        slug: "last-dusk",
        category: "Distant leaf",
        isPublic: true,
        updatedAt: "2026-07-24",
    },
    {
        id: "2",
        title: "Epilogue: Secrets of Barovia",
        slug: "epilogue",
        category: "Distant leaf",
        isPublic: false,
        updatedAt: "2026-07-27",
    },
];

export default function AdminDashboard() {
    const [leaves, setLeaves] = useState<PageLeaf[]>(MOCK_LEAVES);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Form State for new leaf
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("Leaf");
    const [content, setContent] = useState("");

    const handleToggleVisibility = (id: string) => {
        setLeaves((prev) =>
            prev.map((leaf) =>
                leaf.id === id ? { ...leaf, isPublic: !leaf.isPublic } : leaf,
            ),
        );
    };

    const handleDelete = (id: string) => {
        if (
            confirm("Are you sure you wish to strike this leaf from the Tome?")
        ) {
            setLeaves((prev) => prev.filter((leaf) => leaf.id !== id));
        }
    };

    const handleCopyLink = (slug: string, id: string) => {
        const fullUrl = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <main className="min-h-screen bg-background px-6 py-12 text-foreground">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-blood/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.45em] text-blood-light/80">
                            Keeper Scriptorium
                        </p>
                        <h1 className="mt-1 font-serif text-3xl font-semibold text-page-top">
                            Manage Tome Leaves
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-blood/40 bg-blood/20 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-blood/30"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <span>Draft New Leaf</span>
                    </button>
                </div>

                {/* Leaves Management Table / Cards */}
                <div className="rounded-2xl border border-blood/20 bg-slate-950/60 p-6 backdrop-blur-sm">
                    <h2 className="mb-4 font-serif text-xl font-medium text-page-top">
                        Your Authored Pages
                    </h2>

                    <div className="divide-y divide-blood/10">
                        {leaves.map((leaf) => (
                            <div
                                key={leaf.id}
                                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                {/* Page Info */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                leaf.isPublic
                                                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                                    : "bg-amber-500/80"
                                            }`}
                                        />
                                        <span className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-foreground-soft">
                                            {leaf.category} • /{leaf.slug}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-lg font-medium text-foreground">
                                        {leaf.title}
                                    </h3>

                                    <p className="text-xs text-foreground-soft">
                                        Last revised on {leaf.updatedAt}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Public Link Share */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopyLink(leaf.slug, leaf.id)
                                        }
                                        className="rounded-lg border border-blood/20 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-foreground-soft transition-colors hover:border-blood/40 hover:text-foreground"
                                    >
                                        {copiedId === leaf.id
                                            ? "Copied!"
                                            : "Copy Player Link"}
                                    </button>

                                    {/* View Public Page */}
                                    <Link
                                        href={`/${leaf.slug}`}
                                        target="_blank"
                                        className="rounded-lg border border-blood/20 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-foreground-soft transition-colors hover:border-blood/40 hover:text-foreground"
                                    >
                                        Preview
                                    </Link>

                                    {/* Visibility Toggle */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleVisibility(leaf.id)
                                        }
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                            leaf.isPublic
                                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                : "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                        }`}
                                    >
                                        {leaf.isPublic ? "Public" : "Hidden"}
                                    </button>

                                    {/* Edit Placeholder */}
                                    <button
                                        type="button"
                                        className="rounded-lg border border-blood/30 bg-blood/10 px-3 py-1.5 text-xs font-medium text-ember transition-colors hover:bg-blood/20"
                                    >
                                        Edit
                                    </button>

                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(leaf.id)}
                                        className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/30"
                                    >
                                        Strike
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Overlay for Creating a Page */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-blood/30 bg-slate-950 p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between border-b border-blood/20 pb-4">
                            <h2 className="font-serif text-2xl text-page-top">
                                Inscribe a New Leaf
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-foreground-soft hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                // FireStore insertion will wire up here later
                                setShowCreateModal(false);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-wider text-foreground-soft">
                                    Page Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., The Domain of Dread"
                                    required
                                    className="w-full rounded-xl border border-blood/20 bg-slate-900/80 px-4 py-2.5 text-sm text-foreground focus:border-blood/50 focus:outline-none"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs uppercase tracking-wider text-foreground-soft">
                                        URL Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(e.target.value)
                                        }
                                        placeholder="domain-of-dread"
                                        required
                                        className="w-full rounded-xl border border-blood/20 bg-slate-900/80 px-4 py-2.5 text-sm text-foreground focus:border-blood/50 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs uppercase tracking-wider text-foreground-soft">
                                        Category Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                        placeholder="Front leaf / Lore"
                                        className="w-full rounded-xl border border-blood/20 bg-slate-900/80 px-4 py-2.5 text-sm text-foreground focus:border-blood/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-wider text-foreground-soft">
                                    Leaf Content (Markdown/HTML)
                                </label>
                                <textarea
                                    rows={6}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Inscribe the chapter's secrets..."
                                    className="w-full rounded-xl border border-blood/20 bg-slate-900/80 p-4 text-sm text-foreground focus:border-blood/50 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-blood/20 px-4 py-2 text-sm text-foreground-soft hover:bg-white/[0.05]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl border border-blood/40 bg-blood/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-blood/30"
                                >
                                    Save Leaf
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
