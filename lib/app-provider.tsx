import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import { User } from 'firebase/auth';
import { onAuthChange } from './auth';
import {
  AppContext,
  type AppContextType,
  type Plant,
  type CareTask,
  type Achievement,
  type UserProfile,
  type UserPreferences,
  type Insight,
  type CareEvent,
  loadPlants,
  savePlants,
  loadTasks,
  saveTasks,
  loadProfile,
  saveProfile,
  loadPreferences,
  savePreferences,
  loadAchievements,
  saveAchievements,
  loadInsights,
  saveInsights,
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
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setAuthLoading(false);

      // If user logged out, clear app data
      if (!authUser) {
        setPlants([]);
        setTasks([]);
        setProfile(DEFAULT_PROFILE);
        setPreferences(DEFAULT_PREFERENCES);
        setAchievements(DEFAULT_ACHIEVEMENTS);
        setInsights([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [
          loadedPlants,
          loadedTasks,
          loadedProfile,
          loadedPreferences,
          loadedAchievements,
          loadedInsights,
        ] = await Promise.all([
          loadPlants(),
          loadTasks(),
          loadProfile(),
          loadPreferences(),
          loadAchievements(),
          loadInsights(),
        ]);

        setPlants(loadedPlants);
        setTasks(loadedTasks);
        setProfile(loadedProfile);
        setPreferences(loadedPreferences);
        setAchievements(loadedAchievements);
        setInsights(loadedInsights);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const refreshData = useCallback(async () => {
    const [loadedPlants, loadedTasks, loadedInsights] = await Promise.all([
      loadPlants(),
      loadTasks(),
      loadInsights(),
    ]);
    setPlants(loadedPlants);
    setTasks(loadedTasks);
    setInsights(loadedInsights);
  }, []);

  const addPlant = useCallback(async (plantData: Omit<Plant, "id" | "dateAdded" | "careHistory" | "photos" | "diagnosisHistory" | "notes">): Promise<Plant> => {
    const newPlant: Plant = {
      ...plantData,
      id: generateId(),
      dateAdded: new Date().toISOString(),
      careHistory: [],
      photos: [],
      diagnosisHistory: [],
      notes: [],
    };

    const updatedPlants = [...plants, newPlant];
    setPlants(updatedPlants);
    await savePlants(updatedPlants);

    // Generate initial care tasks
    const now = new Date();
    const newTasks: CareTask[] = [
      {
        id: generateId(),
        plantId: newPlant.id,
        type: "water",
        dueDate: new Date(now.getTime() + newPlant.wateringFrequencyDays * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
      {
        id: generateId(),
        plantId: newPlant.id,
        type: "mist",
        dueDate: new Date(now.getTime() + newPlant.mistingFrequencyDays * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
    ];

    const updatedTasks = [...tasks, ...newTasks];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);

    // Update profile
    const updatedProfile = {
      ...profile,
      totalPlantsAdded: profile.totalPlantsAdded + 1,
    };
    setProfile(updatedProfile);
    await saveProfile(updatedProfile);

    // Check for first plant achievement
    if (updatedPlants.length === 1) {
      await unlockAchievement("first-bloom");
    }

    // Check for jungle king achievement
    if (updatedPlants.length >= 10) {
      await unlockAchievement("jungle-king");
    }

    return newPlant;
  }, [plants, tasks, profile]);

  const updatePlant = useCallback(async (id: string, updates: Partial<Plant>) => {
    const updatedPlants = plants.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setPlants(updatedPlants);
    await savePlants(updatedPlants);
  }, [plants]);

  const removePlant = useCallback(async (id: string) => {
    const updatedPlants = plants.filter((p) => p.id !== id);
    setPlants(updatedPlants);
    await savePlants(updatedPlants);

    // Remove associated tasks
    const updatedTasks = tasks.filter((t) => t.plantId !== id);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  }, [plants, tasks]);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    const updatedAchievements = achievements.map((a) =>
      a.id === achievementId && !a.unlockedAt
        ? { ...a, unlockedAt: new Date().toISOString() }
        : a
    );
    setAchievements(updatedAchievements);
    await saveAchievements(updatedAchievements);
  }, [achievements]);

  const completeTask = useCallback(async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const now = new Date();
    const xpEarned = 25;

    // Mark task as completed
    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? { ...t, completed: true, completedDate: now.toISOString(), xpEarned }
        : t
    );

    // Create next task
    const plant = plants.find((p) => p.id === task.plantId);
    if (plant) {
      const frequencyMap = {
        water: plant.wateringFrequencyDays,
        mist: plant.mistingFrequencyDays,
        fertilize: plant.fertilizingFrequencyDays,
        rotate: plant.rotatingFrequencyDays,
      };
      const nextDueDate = new Date(now.getTime() + frequencyMap[task.type] * 24 * 60 * 60 * 1000);

      updatedTasks.push({
        id: generateId(),
        plantId: task.plantId,
        type: task.type,
        dueDate: nextDueDate.toISOString(),
        completed: false,
      });

      // Update plant's last action date
      const updateField = {
        water: "lastWatered",
        mist: "lastMisted",
        fertilize: "lastFertilized",
        rotate: "lastRotated",
      }[task.type] as keyof Plant;

      await updatePlant(plant.id, { [updateField]: now.toISOString() });
    }

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);

    // Add XP
    await addXP(xpEarned);

    // Update streak
    const lastActive = new Date(profile.lastActiveDate);
    const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    const updatedProfile = {
      ...profile,
      totalTasksCompleted: profile.totalTasksCompleted + 1,
      lastActiveDate: now.toISOString(),
      streakDays: daysSinceActive <= 1 ? profile.streakDays + (daysSinceActive === 1 ? 1 : 0) : 1,
    };
    setProfile(updatedProfile);
    await saveProfile(updatedProfile);

    // Check streak achievements
    if (updatedProfile.streakDays >= 7) {
      await unlockAchievement("hydration-hero");
    }
    if (updatedProfile.streakDays >= 30) {
      await unlockAchievement("consistency-champion");
    }
    if (updatedProfile.totalTasksCompleted >= 50) {
      await unlockAchievement("green-thumb");
    }
  }, [tasks, plants, profile, updatePlant]);

  const snoozeTask = useCallback(async (taskId: string, days: number) => {
    const now = new Date();
    const snoozedUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? { ...t, dueDate: snoozedUntil.toISOString(), snoozedUntil: snoozedUntil.toISOString() }
        : t
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  }, [tasks]);

  const addXP = useCallback(async (amount: number) => {
    const newXP = profile.xp + amount;
    const { level, levelName } = calculateLevel(newXP);

    const updatedProfile = {
      ...profile,
      xp: newXP,
      level,
      levelName,
    };
    setProfile(updatedProfile);
    await saveProfile(updatedProfile);
  }, [profile]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...updates };
    setPreferences(updatedPreferences);
    await savePreferences(updatedPreferences);
  }, [preferences]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    await saveProfile(updatedProfile);
  }, [profile]);

  const logCareEvent = useCallback(async (plantId: string, type: CareEvent["type"], note?: string) => {
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return;

    const event: CareEvent = {
      id: generateId(),
      type,
      date: new Date().toISOString(),
      note,
    };

    const updatedPlant = {
      ...plant,
      careHistory: [...plant.careHistory, event],
    };

    await updatePlant(plantId, updatedPlant);
  }, [plants, updatePlant]);

  const addInsight = useCallback(async (insightData: Omit<Insight, "id" | "createdAt" | "dismissed">) => {
    const newInsight: Insight = {
      ...insightData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      dismissed: false,
    };

    const updatedInsights = [newInsight, ...insights];
    setInsights(updatedInsights);
    await saveInsights(updatedInsights);
  }, [insights]);

  const dismissInsight = useCallback(async (id: string) => {
    const updatedInsights = insights.map((i) =>
      i.id === id ? { ...i, dismissed: true } : i
    );
    setInsights(updatedInsights);
    await saveInsights(updatedInsights);
  }, [insights]);

  const contextValue: AppContextType = {
    plants,
    tasks,
    achievements,
    profile,
    preferences,
    insights,
    addPlant,
    updatePlant,
    removePlant,
    completeTask,
    snoozeTask,
    addXP,
    updatePreferences,
    updateProfile,
    refreshData,
    logCareEvent,
    addInsight,
    dismissInsight,
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
