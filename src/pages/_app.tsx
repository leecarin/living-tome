import "@/styles/globals.css";
import type { AppProps } from "next/app";
import RouteGuard from "@/components/RouteGuard";
import ChapterShell from "@/components/ChapterShell";

const PROTECTED_ROUTES = ["/admin"];
const fallbackRoute = "/auth";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <RouteGuard
            protectedRoutes={PROTECTED_ROUTES}
            fallbackRoute={fallbackRoute}
        >
            <ChapterShell>
                <Component {...pageProps} />
            </ChapterShell>
        </RouteGuard>
    );
}
