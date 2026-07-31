import { useState } from "react";
import { useAtomValue } from "jotai";
import useSWR from "swr";
import Link from "next/link";

import { authAtom } from "@/store/auth";
import {
    createUserChapter,
    editUserChapter,
    getUserChapters,
    removeUserChapter,
    slugify,
    toggleChapterVisibility,
} from "@/lib/firebase/db/firestore";
import type { Chapter } from "@/lib/firebase/db/schema";
import { getCurrentUser } from "@/lib/firebase/auth";

const user = getCurrentUser();
const user_id = user?.uid;

// Empty draft shape used to back the create/edit form
interface LeafDraft {
    title: string;
    slug: string;
    chapterOrder: string; // kept as string while editing, parsed to number on submit
    passage: string;
}

const EMPTY_DRAFT: LeafDraft = {
    title: "",
    slug: "",
    chapterOrder: "",
    passage: "",
};

function formatUpdatedAt(chapter: Chapter): string {
    const value = chapter.updated_at as { toDate?: () => Date } | undefined;
    if (value && typeof value.toDate === "function") {
        return value.toDate().toISOString().slice(0, 10);
    }
    return "just now";
}

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAtomValue(authAtom);

    const [showModal, setShowModal] = useState(false);
    const [editingLeaf, setEditingLeaf] = useState<Chapter | null>(null);
    const [draft, setDraft] = useState<LeafDraft>(EMPTY_DRAFT);
    const [saving, setSaving] = useState(false);

    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Fetch (and revalidate) this user's authored leaves via SWR. The key is
    // null while there's no user yet, which tells SWR not to fetch.
    const {
        data: leaves = [],
        error: fetchError,
        isLoading: leavesLoading,
        mutate: mutateLeaves,
    } = useSWR(
        user ? (["user-chapters", user.uid] as const) : null,
        ([, userId]) => getUserChapters(userId),
    );

    const errorMessage =
        actionError ??
        (fetchError instanceof Error
            ? fetchError.message
            : fetchError
              ? "Failed to load your leaves."
              : null);

    function openCreateModal() {
        setEditingLeaf(null);
        setDraft({
            ...EMPTY_DRAFT,
            chapterOrder: String(
                leaves.reduce((max, l) => Math.max(max, l.chapter_order), 0) +
                    1,
            ),
        });
        setShowModal(true);
    }

    function openEditModal(leaf: Chapter) {
        setEditingLeaf(leaf);
        setDraft({
            title: leaf.title,
            slug: leaf.slug,
            chapterOrder: String(leaf.chapter_order),
            passage: leaf.passage,
        });
        setShowModal(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setActionError(null);

        const chapterOrder = Number(draft.chapterOrder);

        try {
            if (editingLeaf) {
                await editUserChapter(editingLeaf.id, user.uid, {
                    title: draft.title,
                    slug: draft.slug ? slugify(draft.slug) : undefined,
                    chapter_order: chapterOrder,
                    passage: draft.passage,
                });
            } else {
                await createUserChapter({
                    title: draft.title,
                    slug: draft.slug
                        ? slugify(draft.slug)
                        : slugify(draft.title),
                    chapter_order: chapterOrder,
                    passage: draft.passage,
                    user_id: user.uid,
                    parent_chapter_id: null,
                    is_original: false,
                    is_hidden: false,
                });
            }

            setShowModal(false);
            setDraft(EMPTY_DRAFT);
            setEditingLeaf(null);
            await mutateLeaves();
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Failed to save this leaf.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleVisibility(leaf: Chapter) {
        if (!user) return;
        setPendingId(leaf.id);
        setActionError(null);
        try {
            await toggleChapterVisibility(leaf.id, user.uid, !leaf.is_hidden);
            await mutateLeaves();
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Failed to update visibility.",
            );
        } finally {
            setPendingId(null);
        }
    }

    async function handleDelete(leaf: Chapter) {
        if (!user) return;
        if (
            !confirm("Are you sure you wish to strike this leaf from the Tome?")
        ) {
            return;
        }

        setPendingId(leaf.id);
        setActionError(null);
        try {
            await removeUserChapter(leaf.id, user.uid);
            await mutateLeaves();
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete this leaf.",
            );
        } finally {
            setPendingId(null);
        }
    }

    function handleCopyLink(leaf: Chapter) {
        const fullUrl = `${window.location.origin}/u/${user_id}/${leaf.slug}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(leaf.id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    if (authLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground-soft">
                Summoning your session...
            </main>
        );
    }

    if (!user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground-soft">
                Sign in to manage your Tome leaves.
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-6 py-12 text-foreground">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-blood/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.45em] text-blood-light/80">
                            Keeper Scriptorium
                        </p>
                        <h1 className="mt-1 font-serif text-3xl text-page-top tracking-widest">
                            Manage Chapters
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="btn-draft"
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

                {errorMessage && (
                    <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                        {errorMessage}
                    </div>
                )}

                {/* Leaves Management Table / Cards */}
                <div className="rounded-2xl border border-moonlight/20 bg-mist/8 p-6 backdrop-blur-sm">
                    <h2 className="mb-4 font-serif text-xl font-medium text-page-top">
                        Your Authored Pages
                    </h2>

                    {leavesLoading ? (
                        <p className="py-8 text-center text-sm text-foreground-soft">
                            Gathering your leaves...
                        </p>
                    ) : leaves.length === 0 ? (
                        <p className="py-8 text-center text-sm text-foreground-soft">
                            You haven&apos;t authored any leaves yet. Draft your
                            first one above.
                        </p>
                    ) : (
                        <div className="divide-y divide-mist/50">
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
                                                    !leaf.is_hidden
                                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                                        : "bg-amber-500/80"
                                                }`}
                                            />
                                            <span className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-foreground-soft">
                                                {leaf.parent_chapter_id
                                                    ? "Edited leaf"
                                                    : "New leaf"}{" "}
                                                • /{leaf.slug}
                                            </span>
                                        </div>

                                        <h3 className="font-serif text-lg font-medium text-foreground tracking-widest">
                                            {leaf.title}
                                        </h3>

                                        <p className="text-[0.8rem] text-foreground-soft tracking-widest">
                                            Last revised on{" "}
                                            {formatUpdatedAt(leaf)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Public Link Share */}
                                        <button
                                            type="button"
                                            onClick={() => handleCopyLink(leaf)}
                                            className="btn-action-compact"
                                        >
                                            {copiedId === leaf.id
                                                ? "Copied!"
                                                : "Copy Player Link"}
                                        </button>

                                        {/* View Public Page */}
                                        <Link
                                            href={`/u/${user_id}/${leaf.slug}`}
                                            target="_blank"
                                            className="btn-action-compact"
                                        >
                                            Preview
                                        </Link>

                                        {/* Visibility Toggle */}
                                        <button
                                            type="button"
                                            disabled={pendingId === leaf.id}
                                            onClick={() =>
                                                handleToggleVisibility(leaf)
                                            }
                                            className={`btn-toggle ${!leaf.is_hidden ? "btn-toggle-public" : "btn-toggle-hidden"}`}
                                        >
                                            {!leaf.is_hidden
                                                ? "Public"
                                                : "Hidden"}
                                        </button>

                                        {/* Edit */}
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(leaf)}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            disabled={pendingId === leaf.id}
                                            onClick={() => handleDelete(leaf)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Overlay for Creating / Editing a Page */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-mist/30 bg-slate-800 p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between border-b border-mist/20 pb-4">
                            <h2 className="font-serif text-2xl text-page-top">
                                {editingLeaf
                                    ? "Revise a Leaf"
                                    : "Inscribe a New Leaf"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-foreground-soft hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-widest text-foreground-soft">
                                    Page Title
                                </label>
                                <input
                                    type="text"
                                    value={draft.title}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., The Domain of Dread"
                                    required
                                    className="input-box"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs uppercase tracking-widest text-foreground-soft">
                                        URL Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={draft.slug}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                slug: e.target.value,
                                            }))
                                        }
                                        placeholder="domain-of-dread (auto-generated if left blank)"
                                        className="input-box"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs uppercase tracking-widest text-foreground-soft">
                                        Chapter Order
                                    </label>
                                    <input
                                        type="number"
                                        value={draft.chapterOrder}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                chapterOrder: e.target.value,
                                            }))
                                        }
                                        required
                                        className="input-box"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-widest text-foreground-soft">
                                    Leaf Content (Markdown/HTML)
                                </label>
                                <textarea
                                    rows={6}
                                    value={draft.passage}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            passage: e.target.value,
                                        }))
                                    }
                                    placeholder="Inscribe the chapter's secrets..."
                                    required
                                    className="input-box"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl border border-moonlight/50 px-4 py-2 text-sm text-foreground-soft hover:bg-mist/20"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl border border-blood/30 bg-blood/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-blood/65 disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Leaf"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
