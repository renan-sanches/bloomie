import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import { User } from 'firebase/auth';
import { onAuthChange } from './auth';
import {
  subscribeToUserPlants,
  subscribeToCareHistory,
  subscribeToUserProfile,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  createPlant,
  updatePlant,
  deletePlant,
  addCareActivity,
  type Plant as FirestorePlant,
  type CareActivity,
  type UserProfile as FirestoreUserProfile,
} from './firestore';
import {
  AppContext,
  type AppContextType,
  type Plant,
  type CareTask,
  type Achievement,
  type UserProfile,
  type UserPreferences,
  type Insight,
  DEFAULT_PROFILE,
  DEFAULT_PREFERENCES,
  DEFAULT_ACHIEVEMENTS,
  generateId,
  calculateLevel,
} from "./store";

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [plants, setPlants] = useState<Plant[]>([]);
  const [careHistory, setCareHistory] = useState<CareActivity[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Check if user profile exists, create if not
        const userProfile = await getUserProfile(currentUser.uid);
        if (!userProfile && currentUser.email) {
          await createUserProfile(
            currentUser.uid,
            currentUser.email,
            currentUser.displayName || 'User'
          );
        }
      } else {
        // Clear state on logout
        setPlants([]);
        setCareHistory([]);
        setTasks([]);
        setProfile(DEFAULT_PROFILE);
        setPreferences(DEFAULT_PREFERENCES);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to plants when user is authenticated
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to real-time user profile updates
    const unsubscribeProfile = subscribeToUserProfile(user.uid, (firestoreProfile) => {
      const { level, levelName, progress } = calculateLevel(firestoreProfile.xp || 0);

      setProfile({
        id: firestoreProfile.uid,
        username: firestoreProfile.username || firestoreProfile.displayName || 'User',
        experienceLevel: firestoreProfile.experienceLevel || 'beginner',
        xp: firestoreProfile.xp || 0,
        totalXP: firestoreProfile.xp || 0,
        level,
        levelName,
        streakDays: firestoreProfile.streakDays || 0,
        currentStreak: firestoreProfile.streakDays || 0,
        totalPlantsAdded: firestoreProfile.totalPlantsAdded || 0,
        totalTasksCompleted: firestoreProfile.totalTasksCompleted || 0,
        tasksCompleted: firestoreProfile.totalTasksCompleted || 0,
        lastActiveDate: firestoreProfile.lastActiveDate?.toMillis().toString() || new Date().toISOString(),
      });

      if (firestoreProfile.preferences) {
        setPreferences({
          theme: firestoreProfile.preferences.theme || 'light',
          notifications: firestoreProfile.preferences.notificationsEnabled,
          notificationsEnabled: firestoreProfile.preferences.notificationsEnabled,
          morningReminders: firestoreProfile.preferences.morningReminders ?? true,
          weeklySummaries: firestoreProfile.preferences.weeklySummaries ?? true,
          highContrast: firestoreProfile.preferences.highContrast ?? false,
          reducedMotion: firestoreProfile.preferences.reducedMotion ?? false,
          hapticFeedbackEnabled: firestoreProfile.preferences.hapticFeedbackEnabled ?? true,
          reminderTime: firestoreProfile.preferences.reminderTime || '09:00',
          onboardingCompleted: firestoreProfile.preferences.onboardingCompleted || false,
          preferredUnits: firestoreProfile.preferences.units || 'metric',
          units: firestoreProfile.preferences.units || 'metric',
        });
      }
    });

    // Subscribe to real-time plant updates
    const unsubscribePlants = subscribeToUserPlants(user.uid, (firestorePlants) => {
      // Convert Firestore plants to app plants format
      const appPlants: Plant[] = firestorePlants.map((plant) => ({
        id: plant.id,
        nickname: plant.nickname,
        species: plant.species,
        scientificName: plant.scientificName,
        location: plant.location,
        photo: plant.photo,
        photos: plant.photos?.map(p => ({
          id: p.id,
          uri: p.uri,
          date: p.date.toMillis().toString(),
          note: p.note
        })) || [],
        dateAdded: plant.dateAdded?.toMillis().toString() || new Date().toISOString(),
        lastWatered: plant.lastWatered?.toMillis().toString() || new Date().toISOString(),
        wateringFrequencyDays: plant.wateringFrequencyDays || 7,
        mistingFrequencyDays: plant.mistingFrequencyDays || 3,
        fertilizingFrequencyDays: plant.fertilizingFrequencyDays || 30,
        rotatingFrequencyDays: plant.rotatingFrequencyDays || 7,
        healthScore: plant.healthScore || 100,
        hydrationLevel: plant.hydrationLevel || 80,
        lightExposure: plant.lightExposure || 70,
        humidityLevel: plant.humidityLevel || 60,
        personality: plant.personality || 'chill-vibes',
        notes: plant.notes || [],
        careHistory: [], // Subscriptions handled separately or fetched
        diagnosisHistory: [],
        status: plant.status || 'growing',
        deathReflection: plant.deathReflection,
      }));

      setPlants(appPlants);
      setIsLoading(false);
    });

    // Subscribe to care history
    const unsubscribeHistory = subscribeToCareHistory(user.uid, null, (history) => {
      setCareHistory(history);
    });

    return () => {
      unsubscribeProfile();
      unsubscribePlants();
      unsubscribeHistory();
    };
  }, [user]);

  // Context value
  const value: AppContextType = {
    user,
    plants,
    tasks,
    achievements,
    profile,
    preferences,
    insights,
    isLoading: authLoading || isLoading,

    // Plant operations
    addPlant: useCallback(async (plant) => {
      if (!user) return {} as Plant;

      const plantId = await createPlant(user.uid, {
        nickname: plant.nickname,
        species: plant.species,
        scientificName: plant.scientificName,
        location: plant.location || 'Living Room',
        photo: plant.photo,
        photos: [],
        lastWatered: null,
        wateringFrequencyDays: plant.wateringFrequencyDays || 7,
        mistingFrequencyDays: plant.mistingFrequencyDays || 3,
        fertilizingFrequencyDays: plant.fertilizingFrequencyDays || 30,
        rotatingFrequencyDays: 7,
        healthScore: 100,
        hydrationLevel: 80,
        lightExposure: 70,
        humidityLevel: 60,
        personality: plant.personality || 'chill-vibes',
        notes: plant.notes || [],
        status: 'growing',
      } as any);

      return { ...plant, id: plantId } as Plant;
    }, [user]),

    updatePlant: useCallback(async (id: string, updates: Partial<Plant>) => {
      if (!user) return;

      const firestoreUpdates: any = { ...updates };
      if (updates.nickname) firestoreUpdates.nickname = updates.nickname;

      await updatePlant(user.uid, id, firestoreUpdates);
    }, [user]),

    deletePlant: useCallback(async (id: string) => {
      if (!user) return;

      await deletePlant(user.uid, id);
    }, [user]),

    logCare: useCallback(async (plantId: string, careType: string, notes?: string) => {
      if (!user) return;

      const plant = plants.find(p => p.id === plantId);
      if (!plant) return;

      await addCareActivity(
        user.uid,
        plantId,
        plant.nickname,
        careType as any,
        notes
      );
    }, [user, plants]),

    // Task operations (stub - can be implemented later)
    addTask: useCallback(async (task) => {
      const newTask = {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString(),
        completed: false,
        plantId: task.plantId || '',
        type: task.type || 'water',
        dueDate: task.dueDate || new Date().toISOString(),
      } as CareTask;
      setTasks(prev => [...prev, newTask]);
    }, []),

    updateTask: useCallback(async (id: string, updates: Partial<CareTask>) => {
      setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updates } : task));
    }, []),

    deleteTask: useCallback(async (id: string) => {
      setTasks(prev => prev.filter(task => task.id !== id));
    }, []),

    completeTask: useCallback(async (id: string) => {
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
      ));
    }, []),

    // Profile operations
    updateProfile: useCallback(async (updates: Partial<UserProfile>) => {
      if (!user) return;

      const firestoreUpdates: any = { ...updates };
      // Map some fields back if they were changed
      if (updates.username) firestoreUpdates.username = updates.username;

      await updateUserProfile(user.uid, firestoreUpdates);
      setProfile(prev => ({ ...prev, ...updates }));
    }, [user]),

    updatePreferences: useCallback(async (updates: Partial<UserPreferences>) => {
      if (!user) return;

      const firestorePrefs: any = { ...updates };
      // Map back legacy fields to firestore fields
      if (updates.notificationsEnabled !== undefined) firestorePrefs.notificationsEnabled = updates.notificationsEnabled;
      if (updates.units !== undefined) firestorePrefs.units = updates.units;

      await updateUserPreferences(user.uid, firestorePrefs);
      setPreferences(prev => ({ ...prev, ...updates }));
    }, [user]),

    // Achievement operations (stub)
    unlockAchievement: useCallback(async (id: string) => {
      setAchievements(prev => prev.map(achievement =>
        achievement.id === id ? { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() } : achievement
      ));
    }, []),

    // Insights operations (stub)
    addInsight: useCallback(async (insight) => {
      const newInsight = { ...insight, id: generateId(), createdAt: new Date().toISOString(), dismissed: false };
      setInsights(prev => [...prev, newInsight]);
    }, []),

    dismissInsight: useCallback(async (id: string) => {
      setInsights(prev => prev.filter(insight => insight.id !== id));
    }, []),

    // Other stubs
    snoozeTask: useCallback(async (id: string, days: number) => {
      // Stub
    }, []),
    addXP: useCallback(async (amount: number) => {
      // Stub
    }, []),
    refreshData: useCallback(async () => {
      // Stub
    }, []),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Helper function to calculate health score from Firestore plant
function calculateHealthScore(plant: FirestorePlant): number {
  if (!plant.lastWatered) return 50; // Default for new plants

  const now = Date.now();
  const waterLastDone = plant.lastWatered.toMillis();
  const daysSinceWater = (now - waterLastDone) / (1000 * 60 * 60 * 24);
  const waterFrequency = plant.wateringFrequencyDays || 7;

  // Calculate score based on how close to needing water
  const ratio = daysSinceWater / waterFrequency;

  if (ratio < 0.5) return 95; // Recently watered
  if (ratio < 0.75) return 80; // Good
  if (ratio < 1) return 65; // Getting thirsty
  if (ratio < 1.25) return 45; // Needs water
  return 25; // Very overdue
}
