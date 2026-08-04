import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownBlockProps {
    content: string;
}

export default function MarkdownBlock({ content }: MarkdownBlockProps) {
    return (
        <div data-tome-block className="break-inside-avoid chapter-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => <p className="m-0">{children}</p>,
                    strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="underline decoration-[#8c7457] decoration-1 underline-offset-4"
                        >
                            {children}
                        </a>
                    ),
                    ul: ({ children }) => (
                        <ul className="m-0 list-disc space-y-2 pl-8">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="m-0 list-decimal space-y-2 pl-8">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => <li className="m-0">{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[#8c7457]/50 pl-4 italic text-ink/90">
                            {children}
                        </blockquote>
                    ),
                    h1: ({ children }) => (
                        <h1 className="m-0 text-4xl leading-tight tracking-[0.12em] text-ink">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="m-0 text-3xl leading-tight tracking-[0.1em] text-ink">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="m-0 text-2xl leading-tight tracking-[0.08em] text-ink">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="m-0 text-xl leading-tight tracking-[0.06em] text-ink">
                            {children}
                        </h4>
                    ),
                    code: ({ children }) => (
                        <code className="rounded bg-black/5 px-1 py-0.5 text-sm tracking-normal">
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="m-0 overflow-x-auto rounded-xl bg-black/5 p-3 text-sm leading-7 tracking-normal">
                            {children}
                        </pre>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
