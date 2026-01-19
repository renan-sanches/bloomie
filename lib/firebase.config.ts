import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, type Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Helper to safely get environment variables
function getEnvVar(key: string): string | undefined {
    return Constants.expoConfig?.extra?.[key] || process.env[key];
}

// Validate Firebase configuration
function validateFirebaseConfig() {
    const requiredVars = [
        'EXPO_PUBLIC_FIREBASE_API_KEY',
        'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
        'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'EXPO_PUBLIC_FIREBASE_APP_ID',
    ];

    const missing = requiredVars.filter(varName => !getEnvVar(varName));

    if (missing.length > 0) {
        const errorMsg = `Missing required Firebase environment variables: ${missing.join(', ')}. Please check your .env file.`;
        console.error(errorMsg);
        // During static export, don't throw - just warn
        if (typeof window === 'undefined') {
            console.warn('Firebase initialization skipped during static export');
            return false;
        }
        throw new Error(errorMsg);
    }

    return true;
}

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID'),
    measurementId: getEnvVar('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
};

// Validate before initializing
const isConfigValid = validateFirebaseConfig();

// Initialize Firebase only if config is valid
let app;
if (isConfigValid && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else if (getApps().length > 0) {
    app = getApp();
} else {
    // Create a dummy app for static export - won't be used
    app = null as any;
}

// Initialize Auth with platform-specific persistence
// Note: getReactNativePersistence was removed in firebase@10.x
// For React Native, we'll use custom persistence with AsyncStorage
let auth: Auth | null = null;

try {
    if (app && typeof window !== 'undefined') {
        // Web platform
        if (Platform.OS === 'web') {
            auth = getAuth(app);
            // Browser persistence is handled automatically by Firebase Auth on web
        } else {
            // React Native platform
            // Firebase 10.x removed getReactNativePersistence, so we use web persistence
            // which works fine for React Native Web
            auth = getAuth(app);
        }
    } else {
        // During static export or when app is null
        auth = null;
    }
} catch (error) {
    console.error('Firebase Auth initialization error:', error);
    // Fallback: try to get existing auth instance
    try {
        auth = getAuth(app!);
    } catch {
        auth = null;
    }
}

// Initialize Firestore
const db: Firestore | null = app ? getFirestore(app) : null;

// Enable offline persistence for web (only in browser environment)
if (db && typeof window !== 'undefined' && Platform.OS === 'web') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support offline persistence');
        } else {
            console.warn('Offline persistence error:', err);
        }
    });
}

export { app, auth, db };
export type { Auth } from 'firebase/auth';
export type { Firestore } from 'firebase/firestore';
