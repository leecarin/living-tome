import TomeLayout from "@/components/TomeLayout";
import { useTomeTiming } from "@/hooks/useTomeTiming";

const passage =
    "How many times over the centuries had I met you? How many times have I lost you? I could not say. " +
    "\n\nYou ever wore the same face, under a different name, yet I would know you even if I were blind — " +
    "your quick wit, your stubbornness, and the sharp-tongued quips I would endure from none other, are as " +
    "unmistakable as they are refreshing.\n\nDespite the years, somehow I had always found a way to touch those " +
    "hidden memories in your heart. And somehow, we always lose. Throughout the generations, we have lost over " +
    "and over again, forever trading joy for grief.\n\nIf I could just once break the pattern, break whatever " +
    "curse that keeps us apart. In doing that, I might find freedom for us both.\n\nBut year after year flies by; " +
    "they pile into decades, mass into centuries.\n\nHow many lay before me? And are they all to be as lonely as " +
    "those I've already had? Unable to answer, unwilling to guess, I sit and stare at your portrait and feel " +
    "another night slipping away into the irretrievable past.\n\nIf I could just rest. Sleep. Sleep for more " +
    "than just a single day, sleep away all my sorrows and lose myself in...I am unsure. To drift, dreamless " +
    "and serene. To forget. To...rest.";

const chapterTitle = "Epilogue";

export default function EpiloguePage() {
    const { revealedCount, cycle, handleRefreshInk } = useTomeTiming(passage);

    return (
        <TomeLayout
            title={chapterTitle}
            headerLabel={chapterTitle}
            passage={passage}
            revealedCount={revealedCount}
            cycle={cycle}
            onRefreshInk={handleRefreshInk}
        />
    );
}
