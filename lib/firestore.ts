import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.config';

// Types
export interface UserProfile {
    uid: string;
    email: string;
    username: string;
    displayName: string;
    photoURL?: string;
    experienceLevel: 'beginner' | 'growing' | 'expert';
    createdAt: Timestamp;
    xp: number;
    streakDays: number;
    totalPlantsAdded: number;
    totalTasksCompleted: number;
    lastActiveDate: Timestamp;
    preferences: {
        theme: 'light' | 'dark' | 'auto';
        notificationsEnabled: boolean;
        morningReminders: boolean;
        weeklySummaries: boolean;
        highContrast: boolean;
        reducedMotion: boolean;
        hapticFeedbackEnabled: boolean;
        units: 'metric' | 'imperial';
        reminderTime: string;
        onboardingCompleted: boolean;
    };
}

export interface Plant {
    id: string;
    nickname: string;
    species: string;
    scientificName?: string;
    location: string;
    photo?: string; // Main photo URL
    photos?: Array<{ id: string; uri: string; date: Timestamp; note?: string }>;
    dateAdded: Timestamp;
    lastWatered?: Timestamp;
    lastMisted?: Timestamp;
    lastFertilized?: Timestamp;
    lastRotated?: Timestamp;
    wateringFrequencyDays: number;
    mistingFrequencyDays: number;
    fertilizingFrequencyDays: number;
    rotatingFrequencyDays: number;
    healthScore: number;
    hydrationLevel?: number;
    lightExposure?: number;
    humidityLevel?: number;
    personality?: 'drama-queen' | 'low-maintenance' | 'attention-seeker' | 'silent-treatment' | 'main-character' | 'chill-vibes';
    notes: string[];
    status: 'thirsty' | 'mist' | 'fertilize' | 'thriving' | 'growing' | 'struggling' | 'dormant' | 'dead';
    deathReflection?: string;
    updatedAt: Timestamp;
}

export interface CareActivity {
    id: string;
    plantId: string;
    plantName: string;
    action: 'water' | 'fertilize' | 'mist' | 'prune' | 'repot' | 'rotate';
    timestamp: Timestamp;
    notes?: string;
}

// ========================================
// USER PROFILE OPERATIONS
// ========================================

/**
 * Create a new user profile document
 */
export async function createUserProfile(
    uid: string,
    email: string,
    displayName: string
): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        uid,
        email,
        username: displayName,
        displayName,
        photoURL: null,
        createdAt: serverTimestamp(),
        xp: 0,
        streakDays: 0,
        totalPlantsAdded: 0,
        totalTasksCompleted: 0,
        lastActiveDate: serverTimestamp(),
        preferences: {
            theme: 'light',
            notificationsEnabled: true,
            morningReminders: true,
            weeklySummaries: true,
            highContrast: false,
            reducedMotion: false,
            hapticFeedbackEnabled: true,
            units: 'metric',
            reminderTime: '09:00',
            onboardingCompleted: false,
        },
    });
}

/**
 * Get user profile
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    uid: string,
    data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'preferences'>>
): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    } as any);
}

/**
 * Subscribe to real-time updates for user profile
 */
export function subscribeToUserProfile(
    uid: string,
    callback: (profile: UserProfile) => void
): () => void {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as UserProfile);
        }
    });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
    uid: string,
    preferences: Partial<UserProfile['preferences']>
): Promise<void> {
    const userRef = doc(db, 'users', uid);
    const updates: any = {};

    // Map preferences to field paths
    Object.keys(preferences).forEach(key => {
        updates[`preferences.${key}`] = preferences[key as keyof UserProfile['preferences']];
    });

    await updateDoc(userRef, updates);
}

// ========================================
// PLANT OPERATIONS
// ========================================

/**
 * Create a new plant
 */
export async function createPlant(
    userId: string,
    plantData: Omit<Plant, 'id' | 'dateAdded' | 'updatedAt'>
): Promise<string> {
    const plantsRef = collection(db, 'users', userId, 'plants');
    const docRef = await addDoc(plantsRef, {
        ...plantData,
        dateAdded: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Get all plants for a user
 */
export async function getUserPlants(userId: string): Promise<Plant[]> {
    const plantsRef = collection(db, 'users', userId, 'plants');
    const q = query(plantsRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Plant[];
}

/**
 * Get a single plant by ID
 */
export async function getPlant(userId: string, plantId: string): Promise<Plant | null> {
    const plantRef = doc(db, 'users', userId, 'plants', plantId);
    const plantSnap = await getDoc(plantRef);

    if (plantSnap.exists()) {
        return { id: plantSnap.id, ...plantSnap.data() } as Plant;
    }
    return null;
}

/**
 * Update a plant
 */
export async function updatePlant(
    userId: string,
    plantId: string,
    data: Partial<Plant>
): Promise<void> {
    const plantRef = doc(db, 'users', userId, 'plants', plantId);
    await updateDoc(plantRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a plant
 */
export async function deletePlant(userId: string, plantId: string): Promise<void> {
    const plantRef = doc(db, 'users', userId, 'plants', plantId);
    await deleteDoc(plantRef);
}

/**
 * Subscribe to real-time updates for user's plants
 */
export function subscribeToUserPlants(
    userId: string,
    callback: (plants: Plant[]) => void
): () => void {
    const plantsRef = collection(db, 'users', userId, 'plants');
    const q = query(plantsRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const plants = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Plant[];
        callback(plants);
    });
}

// ========================================
// CARE HISTORY OPERATIONS
// ========================================

/**
 * Add a care activity to history
 */
export async function addCareActivity(
    userId: string,
    plantId: string,
    plantName: string,
    action: CareActivity['action'],
    notes?: string
): Promise<string> {
    const historyRef = collection(db, 'users', userId, 'careHistory');
    const docRef = await addDoc(historyRef, {
        plantId,
        plantName,
        action,
        timestamp: serverTimestamp(),
        notes: notes || null,
    });

    // Also update the plant's last care timestamp
    const plantRef = doc(db, 'users', userId, 'plants', plantId);
    const updateData: any = {
        updatedAt: serverTimestamp(),
    };

    if (action === 'water') {
        updateData.lastWatered = serverTimestamp();
    } else if (action === 'mist') {
        updateData.lastMisted = serverTimestamp();
    } else if (action === 'fertilize') {
        updateData.lastFertilized = serverTimestamp();
    } else if (action === 'rotate') {
        updateData.lastRotated = serverTimestamp();
    }

    await updateDoc(plantRef, updateData);

    return docRef.id;
}

/**
 * Get care history (optionally filtered by plant)
 */
export async function getCareHistory(
    userId: string,
    plantId?: string,
    limitCount: number = 50
): Promise<CareActivity[]> {
    const historyRef = collection(db, 'users', userId, 'careHistory');

    let q = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount));

    if (plantId) {
        q = query(
            historyRef,
            where('plantId', '==', plantId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as CareActivity[];
}

/**
 * Subscribe to real-time care history updates
 */
export function subscribeToCareHistory(
    userId: string,
    plantId: string | null,
    callback: (history: CareActivity[]) => void,
    limitCount: number = 50
): () => void {
    const historyRef = collection(db, 'users', userId, 'careHistory');

    let q = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount));

    if (plantId) {
        q = query(
            historyRef,
            where('plantId', '==', plantId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );
    }

    return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as CareActivity[];
        callback(history);
    });
}

