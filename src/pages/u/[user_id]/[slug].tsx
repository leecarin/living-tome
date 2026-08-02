// src/pages/u/[user_id]/[slug].tsx

import type { GetServerSideProps } from "next";
import useSWR from "swr";
import { useEffect } from "react";
import type { User } from "firebase/auth";
import { auth, getCurrentUser } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import TomeLayout from "@/components/TomeLayout";
import { useTomeTiming } from "@/hooks/useTomeTiming";

import { getUserChapterByTitleOrSlug } from "@/lib/firebase/db/firestore";
import {
    serializeChapter,
    type SerializedChapter,
} from "@/lib/firebase/db/serialize";

import { useAtom } from "jotai";
import { authAtom } from "@/store/auth";

interface Props {
    userId: string;
    slug: string;
    fallbackChapter: SerializedChapter | null;
}

type ChapterKey = readonly ["custom-chapter", string, string, User | null];

async function fetchChapter([, userId, slug, currentUser]: ChapterKey) {
    const isAuthor = currentUser?.uid === userId;

    // Pass `isAuthor` so logged-in owners can query their hidden pages
    const chapter = await getUserChapterByTitleOrSlug(userId, slug, isAuthor);
    console.log("Chapter Found: ", JSON.stringify(chapter));
    if (!chapter) return null;

    return serializeChapter(chapter);
}

export default function CustomChapterPage({
    userId,
    slug,
    fallbackChapter,
}: Props) {
    const [authState, setAuthState] = useAtom(authAtom);

    useEffect(() => {
        const cachedUser = getCurrentUser();
        if (cachedUser) {
            setAuthState((prev) => ({ ...prev, user: cachedUser }));
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setAuthState({
                user: firebaseUser,
                loading: false,
            });
        });

        return () => unsubscribe();
    }, [setAuthState]);

    // Compute whether the current client is the author
    const isAuthor = authState.user?.uid === userId;

    const { data: chapter, isLoading } = useSWR<
        SerializedChapter | null,
        Error,
        ChapterKey
    >(["custom-chapter", userId, slug, authState.user], fetchChapter, {
        fallbackData: fallbackChapter,
        revalidateOnFocus: true,
    });

    const { revealedCount, cycle, handleRefreshInk } = useTomeTiming(
        chapter?.passage ?? "",
    );

    // Show loading state while Auth / SWR resolves for potential owners
    if (authState.loading || (isLoading && !chapter)) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground-soft">
                <p>Unrolling leaf...</p>
            </main>
        );
    }

    if (!chapter) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground-soft">
                <p>This leaf is no longer available.</p>
            </main>
        );
    }

    return (
        <>
            {chapter.is_hidden && isAuthor && (
                <div className="bg-ember/50 border-b border-ember/30 px-4 py-2 text-center text-[1rem] font-medium tracking-widest text-moonlight">
                    PREVIEW MODE: This chapter is currently hidden from the
                    public.
                </div>
            )}
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

    let fallbackChapter: SerializedChapter | null = null;

    try {
        // Try fetching as public first
        const chapter = await getUserChapterByTitleOrSlug(userId, slug, false);
        if (chapter) {
            fallbackChapter = serializeChapter(chapter);
        }
    } catch (err) {
        // Permission denied on SSR means it's likely a hidden page;
        // suppress error so client SWR can attempt auth-backed fetch.
    }

    return {
        props: {
            userId,
            slug,
            fallbackChapter,
        },
    };
};
