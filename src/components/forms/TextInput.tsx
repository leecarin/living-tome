import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export default function TextInput({
    label,
    className = "",
    ...props
}: TextInputProps) {
    return (
        <label className="block">
            <span className="mb-2 block text-[0.75rem] font-semibold uppercase tracking-[0.28em] text-[#5d4a37]">
                {label}
            </span>

            <input
                className={`w-full rounded-xl border border-[#b9a27d] bg-[#f6efe2] px-2 py-1 text-[var(--ink)] shadow-inner outline-none transition-all duration-200 placeholder:text-[#90795d] focus:border-[var(--ember)] focus:ring-2 focus:ring-[rgba(185,28,28,0.18)] ${className}`}
                {...props}
            />
        </label>
    );
}
