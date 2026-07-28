import { useAtomValue, useSetAtom } from "jotai";
import { isAnimatingAtom, triggerSkipAnimationAtom } from "@/store/animation";

export default function SkipAnimationButton({
    className = "",
}: {
    className?: string;
}) {
    const isAnimating = useAtomValue(isAnimatingAtom);
    const triggerSkip = useSetAtom(triggerSkipAnimationAtom);

    if (!isAnimating) return null;

    return (
        <button
            type="button"
            onClick={triggerSkip}
            className={`btn-ink ${className}`}
            title="Reveal all chapter text immediately"
        >
            Unveil Full Page
        </button>
    );
}
