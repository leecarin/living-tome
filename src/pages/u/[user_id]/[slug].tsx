// src/pages/u/[user_id]/[slug].tsx

import type { GetServerSideProps } from "next";
import useSWR from "swr";

import TomeLayout from "@/components/TomeLayout";
import { useTomeTiming } from "@/hooks/useTomeTiming";

import { getUserChapterByTitleOrSlug } from "@/lib/firebase/db/firestore";
import {
    serializeChapter,
    type SerializedChapter,
} from "@/lib/firebase/db/serialize";

interface Props {
    userId: string;
    slug: string;
    fallbackChapter: SerializedChapter;
}

type ChapterKey = readonly ["custom-chapter", string, string];

async function fetchChapter([, userId, slug]: ChapterKey) {
    const chapter = await getUserChapterByTitleOrSlug(userId, slug);
    if (!chapter || chapter.is_hidden) return null;
    return serializeChapter(chapter);
}

export default function CustomChapterPage({
    userId,
    slug,
    fallbackChapter,
}: Props) {
    // SSR provides the first paint via `fallbackChapter`; SWR takes over for
    // any client-side revalidation (e.g. tab refocus) after that.
    const { data: chapter } = useSWR<
        SerializedChapter | null,
        Error,
        ChapterKey
    >(["custom-chapter", userId, slug], fetchChapter, {
        fallbackData: fallbackChapter,
    });

    const { revealedCount, cycle, handleRefreshInk } = useTomeTiming(
        chapter?.passage ?? "", // fallback to empty string if chapter is null
    );

    if (!chapter) {
        return (
            <main>
                <p>This leaf is no longer available.</p>
            </main>
        );
    }

    return (
        <>
            <TomeLayout
                title={chapter.title}
                headerLabel={chapter.title}
                passage={chapter.passage}
                revealedCount={revealedCount}
                cycle={cycle}
                onRefreshInk={handleRefreshInk}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const userId = ctx.params?.user_id as string;
    const slug = ctx.params?.slug as string;

    const chapter = await getUserChapterByTitleOrSlug(userId, slug);

    if (!chapter || chapter.is_hidden) {
        return { notFound: true };
    }

    return {
        props: {
            userId,
            slug,
            fallbackChapter: serializeChapter(chapter),
        },
    };
};
