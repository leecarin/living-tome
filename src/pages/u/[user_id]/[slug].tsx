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
    fallbackChapter: SerializedChapter;
}

type ChapterKey = readonly ["custom-chapter", string, string, User | null];

async function fetchChapter([, userId, slug, currentUser]: ChapterKey) {
    const chapter = await getUserChapterByTitleOrSlug(userId, slug);
    if (!chapter) return null;

    // Gate hidden pages: Allow access ONLY if the viewer is the author
    if (chapter.is_hidden) {
        const isAuthor = currentUser?.uid === userId;
        if (!isAuthor) return null;
    }

    return serializeChapter(chapter);
}

export default function CustomChapterPage({
    userId,
    slug,
    fallbackChapter,
}: Props) {
    const [authState, setAuthState] = useAtom(authAtom);

    useEffect(() => {
        // Immediate sync check with getCurrentUser()
        const cachedUser = getCurrentUser();
        if (cachedUser) {
            setAuthState((prev) => ({ ...prev, user: cachedUser }));
        }

        // Subscribe to authoritative Firebase Auth state updates
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setAuthState({
                user: firebaseUser,
                loading: false,
            });
        });

        return () => unsubscribe();
    }, [setAuthState]);

    // Include authState.user in the SWR key so it revalidates when auth initializes
    const { data: chapter } = useSWR<
        SerializedChapter | null,
        Error,
        ChapterKey
    >(["custom-chapter", userId, slug, authState.user], fetchChapter, {
        fallbackData: fallbackChapter,
    });

    const { revealedCount, cycle, handleRefreshInk } = useTomeTiming(
        chapter?.passage ?? "",
    );

    // Initial SSR guard for hidden pages while client auth is loading/unauthenticated
    const isAuthor = authState.user?.uid === userId;
    const isHiddenFromViewer = chapter?.is_hidden && !isAuthor;

    if (!chapter || isHiddenFromViewer) {
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

    const chapter = await getUserChapterByTitleOrSlug(userId, slug);

    // Return 404 only if the document does not exist in Firestore at all
    if (!chapter) {
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
