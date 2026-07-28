import { atom } from "jotai";

/** Tracks whether a typewriter/page reveal animation is active */
export const isAnimatingAtom = atom<boolean>(false);

/** Signal atom to request skipping current animations */
export const skipAnimationSignalAtom = atom<number>(0);

/** Write-only atom to trigger a skip signal */
export const triggerSkipAnimationAtom = atom(null, (_get, set) => {
    set(skipAnimationSignalAtom, (prev) => prev + 1);
    set(isAnimatingAtom, false);
});
