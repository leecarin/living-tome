import { app } from "./client";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    createUserWithEmailAndPassword,
    type UserCredential,
} from "firebase/auth";

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// show the select account prompt every time
googleProvider.setCustomParameters({
    prompt: "select_account",
});

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(
    email: string,
    password: string,
): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in using Google.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Sign the current user out.
 */
export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

/**
 * Get the current user.
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Register a user with email and password.
 */
export async function registerUser(
    email: string,
    password: string,
): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
}
