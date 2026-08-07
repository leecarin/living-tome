// src/config/nextFonts.ts
import {
    Whisper,
    Quicksand,
    Crimson_Text,
    Faculty_Glyphic,
    Nothing_You_Could_Do,
    Allison,
    Square_Peg,
    Mynerve,
    IM_Fell_English,
    Cormorant_Garamond,
    Caveat,
    Ephesis,
    Oooh_Baby,
} from "next/font/google";

export const whisper = Whisper({ weight: "400", subsets: ["latin"] });
export const quicksand = Quicksand({ subsets: ["latin"] });
export const crimsonText = Crimson_Text({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
});
export const facultyGlyphic = Faculty_Glyphic({
    weight: "400",
    subsets: ["latin"],
});
export const nothingYouCouldDo = Nothing_You_Could_Do({
    weight: "400",
    subsets: ["latin"],
});
export const allison = Allison({ weight: "400", subsets: ["latin"] });
export const squarePeg = Square_Peg({ weight: "400", subsets: ["latin"] });
export const mynerve = Mynerve({ weight: "400", subsets: ["latin"] });
export const imFell = IM_Fell_English({ weight: "400", subsets: ["latin"] });
export const cormorant = Cormorant_Garamond({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
});
export const caveat = Caveat({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
});
export const ephesis = Ephesis({ weight: "400", subsets: ["latin"] });
export const ooohBaby = Oooh_Baby({ weight: "400", subsets: ["latin"] });
