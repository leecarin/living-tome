import { Dispatch, SetStateAction, SyntheticEvent } from "react";

import type { Chapter } from "@/lib/firebase/db/schema";

export interface LeafDraft {
    title: string;
    slug: string;
    chapterOrder: string;
    passage: string;
}

interface LeafModalProps {
    isOpen: boolean;
    editingLeaf: Chapter | null;
    draft: LeafDraft;
    setDraft: Dispatch<SetStateAction<LeafDraft>>;
    saving: boolean;
    onClose: () => void;
    onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

export default function LeafModal({
    isOpen,
    editingLeaf,
    draft,
    setDraft,
    saving,
    onClose,
    onSubmit,
}: LeafModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-mist/30 bg-slate-800 p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between border-b border-mist/20 pb-4">
                    <h2 className="font-serif text-2xl text-page-top">
                        {editingLeaf ? "Revise a Leaf" : "Inscribe a New Leaf"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-foreground-soft hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
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
                            onClick={onClose}
                            className="rounded-xl border border-moonlight/50 px-4 py-2 text-sm tracking-wider text-foreground-soft hover:bg-mist/20"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl border border-blood/80 bg-blood/65 px-4 py-2 text-sm font-medium tracking-wider text-foreground hover:bg-blood/80 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Leaf"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
