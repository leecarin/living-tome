import { useAtomValue } from "jotai";
import useSWR from "swr";

import { authAtom } from "@/store/auth";
import {
    getOriginalChapters,
    getUserChapters,
} from "@/lib/firebase/db/firestore";
import {
    serializeChapter,
    type SerializedChapter,
} from "@/lib/firebase/db/serialize";

export interface ChapterListItem {
    href: string;
    label: string;
    code: string;
    category: string;
}

// Static fallback / primary routes that should always exist
const staticOriginalChapters: ChapterListItem[] = [
    { href: "/", label: "Home Page", code: "I", category: "Front leaf" },
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

/**
 * Single source of truth for "what chapters exist and in what order",
 * shared by the sidebar (ChapterShell) and the flip-book page navigation
 * (TomeLayoutFlipBook) so the two never drift out of sync.
 */
export function useChapterList() {
    const { user } = useAtomValue(authAtom);

    const { data: originalChapters = [] } = useSWR<SerializedChapter[]>(
        "original-chapters-list",
        fetchOriginalChapters,
    );

    const { data: customChapters = [] } = useSWR<SerializedChapter[]>(
        user ? ["user-chapters-list", user.uid] : null,
        fetchUserChapters,
    );

    const allOriginals: ChapterListItem[] = [
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

    const allCustoms: ChapterListItem[] = customChapters.map((ch, idx) => ({
        href: `/u/${user?.uid}/${ch.slug}`,
        label: ch.title,
        code: `C-${idx + 1}`,
        category: `Chapter ${ch.chapter_order}`,
    }));

    return {
        user,
        allOriginals,
        allCustoms,
        // Reading order for page-flip navigation: originals, then customs -
        // matches the order ChapterShell renders its two sidebar sections in.
        allChapters: [...allOriginals, ...allCustoms],
    };
}