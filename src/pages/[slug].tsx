// src/pages/[slug].tsx

import type { GetServerSideProps } from "next";
import useSWR from "swr";

import { getOriginalChapterBySlug } from "@/lib/firebase/db/firestore";
import {
    serializeChapter,
    type SerializedChapter,
} from "@/lib/firebase/db/serialize";

import { useTomeTiming } from "@/hooks/useTomeTiming";
import TomeLayout from "@/components/TomeLayout";

interface Props {
    slug: string;
    fallbackChapter: SerializedChapter;
}

type ChapterKey = readonly ["original-chapter", string];

async function fetchChapter([, slug]: ChapterKey) {
    const chapter = await getOriginalChapterBySlug(slug);
    // getOriginalChapterBySlug doesn't filter on is_hidden, so that's checked
    // here — same pattern as the /u/[user_id]/[slug] custom chapter page.
    if (!chapter || chapter.is_hidden) return null;
    return serializeChapter(chapter);
}

export default function ChapterPage({ slug, fallbackChapter }: Props) {
    // SSR provides the first paint via `fallbackChapter`; SWR takes over for
    // any client-side revalidation (e.g. tab refocus) after that.
    const { data: chapter } = useSWR<
        SerializedChapter | null,
        Error,
        ChapterKey
    >(["original-chapter", slug], fetchChapter, {
        fallbackData: fallbackChapter,
    });

    // Hook must run unconditionally on every render, so it gets a safe
    // fallback ("") for the moment chapter is null rather than being
    // skipped — the early return below only affects what gets rendered.
    const { revealedCount, cycle, handleRefreshInk } = useTomeTiming(
        chapter?.passage ?? "",
    );

    if (!chapter) {
        return (
            <main>
                <p>This leaf is no longer available.</p>
            </main>
        );
    }

    return (
        <TomeLayout
            title={chapter.title}
            headerLabel={chapter.title}
            passage={chapter.passage}
            revealedCount={revealedCount}
            cycle={cycle}
            onRefreshInk={handleRefreshInk}
        />
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const slug = ctx.params?.slug as string;

    const chapter = await getOriginalChapterBySlug(slug);

    if (!chapter || chapter.is_hidden) {
        return { notFound: true };
    }

    return {
        props: {
            slug,
            fallbackChapter: serializeChapter(chapter),
        },
    };
};
