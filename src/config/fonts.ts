// src/config/fonts.ts

import {
    whisper,
    crimsonText,
    facultyGlyphic,
    nothingYouCouldDo,
    allison,
    squarePeg,
    mynerve,
    imFell,
    cormorant,
    caveat,
    ephesis,
    ooohBaby,
} from "@/config/nextFonts";

export interface FontOption {
    id: string;
    label: string;
    fontFamily: string;
    className: string;
    // Optional typographic tuning per font family
    fontSize?: string; // e.g., '1.7rem', '2.1rem'
    lineHeight?: string; // e.g., '2.4rem', '2.8rem'
    tracking?: string; // e.g., '1px', '2.1px'
}

// Default fallbacks if a font doesn't specify custom values
export const DEFAULT_FONT_STYLES = {
    fontSize: "1.7rem",
    lineHeight: "2.2rem",
    tracking: "1.5px",
};

export const TOME_FONTS: FontOption[] = [
    // cursive
    {
        id: "whisper",
        label: "Whisper",
        fontFamily: whisper.style.fontFamily,
        className: "font-cursive",
        fontSize: DEFAULT_FONT_STYLES.fontSize,
        lineHeight: DEFAULT_FONT_STYLES.lineHeight,
        tracking: DEFAULT_FONT_STYLES.tracking,
    },
    {
        id: "nothing-you-could-do",
        label: "Nothing You Could Do",
        fontFamily: nothingYouCouldDo.style.fontFamily,
        className: "font-nothing",
        fontSize: "1.3rem",
        lineHeight: "1.7rem",
        tracking: "1.1px",
    },
    {
        id: "allison",
        label: "Allison",
        fontFamily: allison.style.fontFamily,
        className: "font-allison",
        fontSize: "2.0rem",
        lineHeight: "2.1rem",
        tracking: "2.0px",
    },
    {
        id: "square-peg",
        label: "Square Peg",
        fontFamily: squarePeg.style.fontFamily,
        className: "font-square-peg",
        fontSize: "1.8rem",
        lineHeight: "2.4rem",
        tracking: "2.0px",
    },
    {
        id: "mynerve",
        label: "Mynerve",
        fontFamily: mynerve.style.fontFamily,
        className: "font-mynerve",
        fontSize: "1.3rem",
        lineHeight: "2.0rem",
        tracking: "0.7px",
    },
    {
        id: "caveat",
        label: "Caveat",
        fontFamily: caveat.style.fontFamily,
        className: "font-caveat",
        fontSize: "1.6rem",
        lineHeight: DEFAULT_FONT_STYLES.lineHeight,
        tracking: DEFAULT_FONT_STYLES.tracking,
    },
    {
        id: "ephesis",
        label: "Ephesis",
        fontFamily: ephesis.style.fontFamily,
        className: "font-ephesis",
        fontSize: DEFAULT_FONT_STYLES.fontSize,
        lineHeight: DEFAULT_FONT_STYLES.lineHeight,
        tracking: DEFAULT_FONT_STYLES.tracking,
    },
    {
        id: "ooohBaby",
        label: "Oooh Baby",
        fontFamily: ooohBaby.style.fontFamily,
        className: "font-baby",
        fontSize: "1.4rem",
        lineHeight: DEFAULT_FONT_STYLES.lineHeight,
        tracking: DEFAULT_FONT_STYLES.tracking,
    },
    // sans serif
    {
        id: "faculty",
        label: "Faculty Glyphic",
        fontFamily: facultyGlyphic.style.fontFamily,
        className: "font-faculty",
        fontSize: "1.2rem",
        lineHeight: "1.6rem",
        tracking: "0.5px",
    },
    // serif
    {
        id: "crimson",
        label: "Crimson Text",
        fontFamily: crimsonText.style.fontFamily,
        className: "font-serif",
        fontSize: "1.3rem",
        lineHeight: "1.6rem",
        tracking: "0.5px",
    },
    {
        id: "im-fell",
        label: "IM Fell English",
        fontFamily: imFell.style.fontFamily,
        className: "font-imfell",
        fontSize: "1.2rem",
        lineHeight: "1.8rem",
        tracking: "0.5px",
    },
    {
        id: "cormorant",
        label: "Cormorant Garamond",
        fontFamily: cormorant.style.fontFamily,
        className: "font-cormorant",
        fontSize: "1.2rem",
        lineHeight: "1.8rem",
        tracking: "0.5px",
    },
];
