import TomeLayout from "@/components/TomeLayout";
import { useTomeTiming } from "@/hooks/useTomeTiming";

const passage =
    "The dusk elves mistook fear for righteousness.\n\n" +
    "They murdered Patrina, believing they had saved her from a dark fate. " +
    "They called her ambition corruption, her pursuit of power a threat. " +
    "They could not comprehend greatness, so they destroyed it.\n\n" +
    "Today, I reminded them of the cost of their cowardice.\n\n" +
    "Rahadin brought their captured kin before me atop the hill overlooking Vallaki. " +
    "They stood trapped, powerless within my Forcecage, yet still clung to their pride. " +
    "Kasimir, ever the fool, spat at Rahadin and called him a traitor.\n\n" +
    "How amusing. A man who murdered his own sister speaking of betrayal.\n\n" +
    "When the remaining elves were found and brought before me, I gave them the punishment they had earned. " +
    "My magic tore through their ranks, and their screams filled the night.\n\n" +
    "Kasimir attempted defiance, summoning a storm of ice against me. " +
    "I dismissed his spell as easily as one brushes aside a candle flame.\n\n" +
    "Rahadin removed one of his ears for his insolence, leaving him one so he might hear the cries of his people.\n\n" +
    "Hear them he did. " +
    "One by one, the dusk elves became ash upon the hill where they believed themselves righteous.\n\n" +
    "Let this serve as a reminder: those who fear power will always be consumed by it.";

const chapterTitle = "The Fall of the Dusk Elves";

export default function LastDuskPage() {
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
