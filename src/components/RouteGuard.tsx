import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getCurrentUser } from "@/lib/firebase/auth";
import { authAtom } from "@/store/auth";

interface RouteGuardProps {
    children: ReactNode;
    protectedRoutes?: string[];
    fallbackRoute?: string;
}

export default function RouteGuard({
    children,
    protectedRoutes = [],
    fallbackRoute = "/auth",
}: RouteGuardProps) {
    const router = useRouter();
    const [authState, setAuthState] = useAtom(authAtom);

    useEffect(() => {
        // Immediate sync check with getCurrentUser()
        const cachedUser = getCurrentUser();
        if (cachedUser) {
            setAuthState((prev) => ({ ...prev, user: cachedUser }));
        }

        // Subscribe to authoritative Firebase Auth state updates
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setAuthState({
                user: firebaseUser,
                loading: false,
            });
        });

        return () => unsubscribe();
    }, [setAuthState]);

    const isProtectedRoute = protectedRoutes.some((path) =>
        router.pathname.startsWith(path),
    );

    useEffect(() => {
        if (!authState.loading && isProtectedRoute && !authState.user) {
            router.push(fallbackRoute);
        }
    }, [authState, isProtectedRoute, router, fallbackRoute]);

    // Show loading state while validating auth on guarded routes
    if (authState.loading && isProtectedRoute) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <div className="flex items-center gap-3">
                    <span className="h-3 w-3 animate-ping rounded-full bg-blood" />
                    <span className="font-serif text-sm uppercase tracking-[0.3em] text-foreground-soft">
                        Consulting the Tome...
                    </span>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
