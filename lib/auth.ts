import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
} from 'firebase/auth';
import { auth } from './firebase.config';
import { Platform } from 'react-native';

// Auth error messages
const AUTH_ERROR_MESSAGES: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
};

/**
 * Get user-friendly error message from Firebase auth error
 */
export function getAuthErrorMessage(error: any): string {
    const code = error?.code || '';
    return AUTH_ERROR_MESSAGES[code] || 'An error occurred. Please try again.';
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
): Promise<User> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name if provided
        if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }

        return userCredential.user;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Sign in with Google (web only for now)
 */
export async function signInWithGoogle(): Promise<User> {
    if (Platform.OS !== 'web') {
        throw new Error('Google Sign-In is only available on web for now.');
    }

    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        return userCredential.user;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        throw new Error('Failed to sign out. Please try again.');
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return auth.currentUser !== null;
}
