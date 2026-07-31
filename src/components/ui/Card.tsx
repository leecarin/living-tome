import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    children: ReactNode;
}

export default function Card({
    title,
    subtitle,
    children,
    className = "",
    ...props
}: CardProps) {
    return (
        <section
            className={`rounded-3xl border border-[#5a4228] bg-[linear-gradient(180deg,var(--page-top),var(--page-base),var(--page-bottom-left))] p-10 shadow-2xl ${className}`}
            {...props}
        >
            {(title || subtitle) && (
                <header className="mb-8">
                    {title && (
                        <h2 className="mb-2 text-4xl text-[var(--ink)]">
                            {title}
                        </h2>
                    )}

                    {subtitle && (
                        <p className="text-medium text-[#68533d]">{subtitle}</p>
                    )}
                </header>
            )}

            {children}
        </section>
    );
}
