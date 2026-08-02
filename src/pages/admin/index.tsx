import { useState } from "react";
import { useAtomValue } from "jotai";
import useSWR from "swr";
import Link from "next/link";

import LeafModal, { type LeafDraft } from "@/components/admin/LeafModal";
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

    // Fetch (and revalidate) this user's authored leaves via SWR.
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

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
        if (!user) return;
        const fullUrl = `${window.location.origin}/u/${user.uid}/${leaf.slug}`;
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
                        <p className="text-sm font-medium uppercase tracking-[0.38em] text-blood-light/80">
                            Keeper Scriptorium
                        </p>
                        <h1 className="mt-1 font-serif text-4xl text-page-top tracking-[1px]">
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
                    <h2 className="font-serif text-3xl font-medium text-page-top tracking-[1px]">
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
                                    className="flex flex-col py-4 mt-3"
                                >
                                    {/* Status & Title */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full ${
                                                    !leaf.is_hidden
                                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                                        : "bg-amber-500/80"
                                                }`}
                                            />
                                            <span className="text-xs font-medium uppercase tracking-[0.3em] text-foreground-soft">
                                                {leaf.parent_chapter_id
                                                    ? "Edited leaf"
                                                    : "New leaf"}{" "}
                                                •
                                                {` Chapter ${leaf.chapter_order}`}
                                            </span>
                                        </div>

                                        <h3 className="font-serif text-xl font-medium tracking-widest text-foreground pt-1">
                                            {leaf.title}
                                        </h3>
                                    </div>

                                    {/* Bottom Row: Last Revised + Action Buttons */}
                                    <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
                                        <p className="text-xs tracking-widest text-foreground-soft font-faculty">
                                            Last revised on{" "}
                                            {formatUpdatedAt(leaf)}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Public Link Share */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopyLink(leaf)
                                                }
                                                className="btn-action-compact"
                                            >
                                                {copiedId === leaf.id
                                                    ? "Copied!"
                                                    : "Copy Player Link"}
                                            </button>

                                            {/* View Public Page */}
                                            <Link
                                                href={`/u/${user.uid}/${leaf.slug}`}
                                                target="_blank"
                                                className="btn-action-compact"
                                            >
                                                Open Preview
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
                                                onClick={() =>
                                                    openEditModal(leaf)
                                                }
                                                className="btn-edit"
                                            >
                                                Edit
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                disabled={pendingId === leaf.id}
                                                onClick={() =>
                                                    handleDelete(leaf)
                                                }
                                                className="btn-delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <LeafModal
                isOpen={showModal}
                editingLeaf={editingLeaf}
                draft={draft}
                setDraft={setDraft}
                saving={saving}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            />
        </main>
    );
}
