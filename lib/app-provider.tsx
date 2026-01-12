import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import { User } from 'firebase/auth';
import { onAuthChange } from './auth';
import {
  subscribeToUserPlants,
  subscribeToCareHistory,
  createUserProfile,
  getUserProfile,
  type Plant as FirestorePlant,
  type CareActivity,
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

    // Subscribe to real-time plant updates
    const unsubscribePlants = subscribeToUserPlants(user.uid, (firestorePlants) => {
      // Convert Firestore plants to app plants format
      const appPlants: Plant[] = firestorePlants.map((plant) => ({
        id: plant.id,
        nickname: plant.name,
        species: plant.species,
        location: plant.location,
        imageUrl: plant.imageUrl,
        healthScore: calculateHealthScore(plant),
        wateringFrequencyDays: plant.careSchedule.water.frequency,
        mistingFrequencyDays: plant.careSchedule.mist.frequency,
        lastWatered: plant.careSchedule.water.lastDone
          ? plant.careSchedule.water.lastDone.toMillis().toString()
          : undefined,
        dateAdded: plant.createdAt.toMillis().toString(),
        notes: plant.notes ? [plant.notes] : [],
        photos: [],
        careHistory: [],
        diagnosisHistory: [],
        status: plant.status,
      }));

      setPlants(appPlants);
      setIsLoading(false);
    });

    // Subscribe to care history
    const unsubscribeHistory = subscribeToCareHistory(user.uid, null, (history) => {
      setCareHistory(history);
    });

    return () => {
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

      const { createPlant } = await import('./firestore');
      const plantId = await createPlant(user.uid, {
        name: plant.nickname,
        species: plant.species,
        status: 'growing',
        location: plant.location || 'Unknown',
        imageUrl: plant.imageUrl,
        careSchedule: {
          water: {
            frequency: plant.wateringFrequencyDays || 7,
            unit: 'days',
            lastDone: null,
          },
          fertilize: {
            frequency: 14,
            unit: 'days',
            lastDone: null,
          },
          mist: {
            frequency: plant.mistingFrequencyDays || 3,
            unit: 'days',
            lastDone: null,
          },
        },
      });

      return { ...plant, id: plantId } as Plant;
    }, [user]),

    updatePlant: useCallback(async (id: string, updates: Partial<Plant>) => {
      if (!user) return;

      const { updatePlant } = await import('./firestore');
      await updatePlant(user.uid, id, {
        name: updates.nickname,
        species: updates.species,
        location: updates.location,
        status: updates.status,
        imageUrl: updates.imageUrl,
      });
    }, [user]),

    deletePlant: useCallback(async (id: string) => {
      if (!user) return;

      const { deletePlant } = await import('./firestore');
      await deletePlant(user.uid, id);
    }, [user]),

    logCare: useCallback(async (plantId: string, careType: string, notes?: string) => {
      if (!user) return;

      const plant = plants.find(p => p.id === plantId);
      if (!plant) return;

      const { addCareActivity } = await import('./firestore');
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
      const newTask = { ...task, id: generateId(), createdAt: new Date().toISOString(), completed: false };
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

    // Profile operations (stub)
    updateProfile: useCallback(async (updates: Partial<UserProfile>) => {
      setProfile(prev => ({ ...prev, ...updates }));
    }, []),

    updatePreferences: useCallback(async (updates: Partial<UserPreferences>) => {
      setPreferences(prev => ({ ...prev, ...updates }));
    }, []),

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Helper function to calculate health score from Firestore plant
function calculateHealthScore(plant: FirestorePlant): number {
  const now = Date.now();
  const waterLastDone = plant.careSchedule.water.lastDone?.toMillis() || 0;

  if (!waterLastDone) return 50; // Default for new plants

  const daysSinceWater = (now - waterLastDone) / (1000 * 60 * 60 * 24);
  const waterFrequency = plant.careSchedule.water.unit === 'weeks'
    ? plant.careSchedule.water.frequency * 7
    : plant.careSchedule.water.frequency;

  // Calculate score based on how close to needing water
  const ratio = daysSinceWater / waterFrequency;

  if (ratio < 0.5) return 95; // Recently watered
  if (ratio < 0.75) return 80; // Good
  if (ratio < 1) return 65; // Getting thirsty
  if (ratio < 1.25) return 45; // Needs water
  return 25; // Very overdue
}
