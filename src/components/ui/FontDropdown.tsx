// src/components/ui/FontDropdown.tsx

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TOME_FONTS, FontOption } from "@/config/fonts";

interface FontDropdownProps {
    selectedFontId: string;
    onSelectFont: (font: FontOption) => void;
    className?: string;
}

export default function FontDropdown({
    selectedFontId,
    onSelectFont,
    className = "",
}: FontDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentFont =
        TOME_FONTS.find((f) => f.id === selectedFontId) || TOME_FONTS[0];

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-[0.75rem] uppercase tracking-[0.2em] text-foreground-soft transition-colors hover:border-blood hover:text-foreground focus:outline-none focus:ring-1 focus:ring-blood"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="text-sm text-moonlight">Font:</span>
                <span
                    className={`${currentFont.className} normal-case text-moonlight text-sm`}
                >
                    {currentFont.label}
                </span>
                <svg
                    className={`h-3.5 w-3.5 text-mist transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        role="listbox"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-50 mt-2 max-h min-w-max overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-900/95 p-1.5 pr-2 shadow-2xl backdrop-blur-md focus:outline-none tome-scrollbar"
                    >
                        {TOME_FONTS.map((font) => {
                            const isSelected = font.id === currentFont.id;
                            return (
                                <li
                                    key={font.id}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onSelectFont(font);
                                        setIsOpen(false);
                                    }}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-base transition-colors ${
                                        isSelected
                                            ? "bg-mist/20 text-moonlight border border-blood"
                                            : "text-mist hover:bg-mist/10 hover:text-moonlight"
                                    }`}
                                >
                                    {/* Preview string rendered in its native font */}
                                    <span
                                        style={{ fontFamily: font.fontFamily }}
                                        className="truncate normal-case text-sm tracking-[2px]"
                                    >
                                        {font.label}
                                    </span>

                                    {isSelected && (
                                        <svg
                                            className="h-4 w-4 text-moonlight"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
