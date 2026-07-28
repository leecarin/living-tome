import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/router";
import Card from "@/components/ui/Card";
import TextInput from "@/components/forms/TextInput";
import {
    registerUser,
    resetPassword,
    signInWithEmail,
    signInWithGoogle,
} from "@/lib/firebase/auth";

export default function AuthPage() {
    const router = useRouter();

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleRegister(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            await registerUser(registerEmail, registerPassword);

            setMessage("Account successfully created.");
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to register.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleSignIn(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            await signInWithEmail(loginEmail, loginPassword);

            router.push("/admin");
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to sign in.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        try {
            setLoading(true);
            setMessage("");

            await signInWithGoogle();

            router.push("/admin");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Google sign in failed.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleForgotPassword() {
        if (!loginEmail) {
            setMessage("Enter your email address first.");
            return;
        }

        try {
            await resetPassword(loginEmail);

            setMessage("Password reset email sent.");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to send reset email.",
            );
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
            <div className="w-full max-w-6xl">
                <div className="mb-12 text-center">
                    <p className="mb-3 text-xs uppercase tracking-[0.45em] text-foreground-soft">
                        The Living Tome
                    </p>

                    <h1 className="mb-4 text-5xl font-semibold text-page-top">
                        Scriptorium Access
                    </h1>

                    <p className="text-foreground-soft">
                        Only trusted keepers may alter the pages of the Tome.
                    </p>
                </div>

                <div className="grid gap-10 lg:grid-cols-2">
                    {/* Register */}
                    <Card
                        title="Register"
                        subtitle="Create an account to manage the Living Tome."
                    >
                        <form onSubmit={handleRegister} className="space-y-5">
                            <TextInput
                                label="Email"
                                type="email"
                                value={registerEmail}
                                onChange={(e) =>
                                    setRegisterEmail(e.target.value)
                                }
                                required
                            />

                            <TextInput
                                label="Password"
                                type="password"
                                value={registerPassword}
                                onChange={(e) =>
                                    setRegisterPassword(e.target.value)
                                }
                                required
                            />

                            <button
                                type="submit"
                                className="btn-parchment w-full"
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </form>
                    </Card>

                    {/* Login */}
                    <Card
                        title="Sign In"
                        subtitle="Continue editing the Living Tome."
                    >
                        <form onSubmit={handleSignIn} className="space-y-5">
                            <TextInput
                                label="Email"
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />

                            <TextInput
                                label="Password"
                                type="password"
                                value={loginPassword}
                                onChange={(e) =>
                                    setLoginPassword(e.target.value)
                                }
                                required
                            />

                            <button
                                type="submit"
                                className="btn-parchment w-full"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="h-px flex-1 bg-[#bda785]" />
                            <span className="mx-4 text-xs uppercase tracking-[0.3em] text-[#7c654e]">
                                or
                            </span>
                            <div className="h-px flex-1 bg-[#bda785]" />
                        </div>

                        {/* Google Sign-In Button with Official Icon */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 py-3 text-sm font-medium text-[#3c4043] transition-colors hover:bg-[#f8f9fa] focus:outline-none focus:ring-2 focus:ring-[#4285f4]/50 active:bg-[#f1f3f4] disabled:opacity-50"
                        >
                            <svg
                                className="h-4 w-4 shrink-0"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="mt-5 w-full text-center text-sm text-[#6b5640] transition hover:text-[var(--ember)]"
                        >
                            Forgot Password?
                        </button>
                    </Card>
                </div>

                {message && (
                    <div className="mx-auto mt-10 max-w-xl rounded-xl border border-[rgba(185,28,28,0.3)] bg-[rgba(20,16,13,0.55)] px-6 py-4 text-center text-sm text-[var(--moonlight)] backdrop-blur-sm">
                        {message}
                    </div>
                )}
            </div>
        </main>
    );
}
