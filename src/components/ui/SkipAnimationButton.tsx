import { useSetAtom } from "jotai";
import { triggerSkipAnimationAtom } from "@/store/animation";

export default function SkipAnimationButton({
    className = "",
}: {
    className?: string;
}) {
    const triggerSkip = useSetAtom(triggerSkipAnimationAtom);

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
