// src/config/fonts.ts

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
    {
        id: "whisper",
        label: "Whisper",
        fontFamily: '"Whisper", cursive',
        className: "font-cursive",
        fontSize: DEFAULT_FONT_STYLES.fontSize,
        lineHeight: DEFAULT_FONT_STYLES.lineHeight,
        tracking: DEFAULT_FONT_STYLES.tracking,
    },
    {
        id: "crimson",
        label: "Crimson Text",
        fontFamily: '"Crimson Text", serif',
        className: "font-serif",
        fontSize: "1.3rem",
        lineHeight: "1.6rem",
        tracking: "0.5px",
    },
    {
        id: "faculty",
        label: "Faculty Glyphic",
        fontFamily: '"Faculty Glyphic", sans-serif',
        className: "font-faculty",
        fontSize: "1.2rem",
        lineHeight: "1.6rem",
        tracking: "0.5px",
    },
    {
        id: "nothing-you-could-do",
        label: "Nothing You Could Do",
        fontFamily: '"Nothing You Could Do", cursive',
        className: "font-nothing",
        fontSize: "1.3rem",
        lineHeight: "1.7rem",
        tracking: "1.1px",
    },
    {
        id: "allison",
        label: "Allison",
        fontFamily: '"Allison", cursive',
        className: "font-allison",
        fontSize: "2.0rem",
        lineHeight: "2.1rem",
        tracking: "2.0px",
    },
    {
        id: "square-peg",
        label: "Square Peg",
        fontFamily: '"Square Peg", cursive',
        className: "font-square-peg",
        fontSize: "1.8rem",
        lineHeight: "2.4rem",
        tracking: "2.0px",
    },
    {
        id: "mynerve",
        label: "Mynerve",
        fontFamily: '"Mynerve", cursive',
        className: "font-mynerve",
        fontSize: "1.3rem",
        lineHeight: "2.0rem",
        tracking: "0.7px",
    },
    {
        id: "im-fell",
        label: "IM Fell English",
        fontFamily: '"IM Fell English", serif',
        className: "font-imfell",
        fontSize: "1.2rem",
        lineHeight: "1.8rem",
        tracking: "0.5px",
    },
    {
        id: "cormorant",
        label: "Cormorant Garamond",
        fontFamily: '"Cormorant Garamond", serif',
        className: "font-cormorant",
        fontSize: "1.2rem",
        lineHeight: "1.8rem",
        tracking: "0.5px",
    },
];
