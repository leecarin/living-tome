import { atom } from "jotai";
import type { User } from "firebase/auth";

export interface AuthState {
    user: User | null;
    loading: boolean;
}

// Atom to track Firebase Auth state globally
export const authAtom = atom<AuthState>({
    user: null,
    loading: true,
});
