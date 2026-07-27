import "@/styles/globals.css";
import type { AppProps } from "next/app";
import ChapterShell from "@/components/ChapterShell";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ChapterShell>
            <Component {...pageProps} />
        </ChapterShell>
    );
}
