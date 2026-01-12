import { createContext, useContext } from "react";

// Types
export interface Plant {
  id: string;
  nickname: string;
  species: string;
  scientificName?: string;
  photo?: string;
  imageUrl?: string;
  dateAdded: string;
  lastWatered?: string;
  lastMisted?: string;
  lastFertilized?: string;
  lastRotated?: string;
  wateringFrequencyDays: number;
  mistingFrequencyDays: number;
  fertilizingFrequencyDays: number;
  rotatingFrequencyDays: number;
  healthScore: number;
  hydrationLevel?: number;
  lightExposure?: number;
  humidityLevel?: number;
  personality?: PlantPersonality;
  potSize?: string;
  notes: string[];
  photos: PlantPhoto[];
  careHistory: CareEvent[];
  diagnosisHistory: Diagnosis[];
  status: 'thirsty' | 'mist' | 'fertilize' | 'thriving' | 'growing' | 'struggling' | 'dormant' | 'dead';
  location: string;
}

export type PlantPersonality =
  | "drama-queen"
  | "low-maintenance"
  | "attention-seeker"
  | "silent-treatment"
  | "main-character"
  | "chill-vibes";

export interface PlantPhoto {
  id: string;
  uri: string;
  date: string;
  note?: string;
  leafCount?: number;
}

export interface CareEvent {
  id: string;
  type: "water" | "mist" | "fertilize" | "rotate";
  date: string;
  note?: string;
  photo?: string;
}

export interface Diagnosis {
  id: string;
  date: string;
  issue: string;
  severity: "mild" | "moderate" | "severe";
  tips: string[];
  photoUri?: string;
}

export interface CareTask {
  id: string;
  plantId: string;
  type: "water" | "mist" | "fertilize" | "rotate";
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  snoozedUntil?: string;
  xpEarned?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  experienceLevel: "beginner" | "growing" | "expert";
  xp: number;
  totalXP: number; // For profile backward compatibility/legacy code
  level: number;
  levelName: string;
  streakDays: number;
  currentStreak: number; // For profile backward compatibility
  totalPlantsAdded: number;
  totalTasksCompleted: number;
  tasksCompleted: number; // For profile backward compatibility
  lastActiveDate: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  notifications: boolean;
  notificationsEnabled: boolean; // For profile backward compatibility
  morningReminders: boolean;
  weeklySummaries: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  hapticFeedbackEnabled: boolean;
  reminderTime: string;
  onboardingCompleted: boolean;
  preferredUnits: "metric" | "imperial";
  units: "metric" | "imperial"; // For profile backward compatibility
}

export const LEVEL_NAMES = ["Seedling", "Sprout", "Budding", "Blooming", "Flourishing", "Master Gardener"];
export const XP_PER_LEVEL = 100;

export interface Insight {
  id: string;
  plantId?: string;
  type: "tip" | "warning" | "achievement" | "milestone";
  title: string;
  message: string;
  createdAt: string;
  dismissed: boolean;
}

// Context
export interface AppContextType {
  user: any | null;
  plants: Plant[];
  tasks: CareTask[];
  achievements: Achievement[];
  profile: UserProfile;
  preferences: UserPreferences;
  insights: Insight[];
  isLoading: boolean;
  addPlant: (plant: Partial<Plant> & { nickname: string; species: string; location: string }) => Promise<Plant>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  addTask: (task: Partial<CareTask>) => Promise<void>;
  updateTask: (id: string, updates: Partial<CareTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  snoozeTask: (taskId: string, days: number) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  unlockAchievement: (id: string) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshData: () => Promise<void>;
  logCare: (plantId: string, type: string, note?: string) => Promise<void>;
  addInsight: (insight: Omit<Insight, "id" | "createdAt" | "dismissed">) => Promise<void>;
  dismissInsight: (id: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

// Helper functions
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getPlantStatus(plant: Plant): { status: string; message: string; color: string } {
  if (plant.healthScore >= 80) {
    return { status: "happy", message: "Thriving", color: "#64b478" }; // primary
  }
  if ((plant.hydrationLevel ?? 100) < 30) {
    return { status: "thirsty", message: "Needs Water", color: "#66BBE6" }; // accent-water
  }
  if ((plant.lightExposure ?? 100) < 40) {
    return { status: "needs-light", message: "Needs Light", color: "#FFB74D" }; // accent-orange
  }
  return { status: "needs-attention", message: "Needs Care", color: "#F48FB1" }; // accent-pink
}

export function getPersonalityTagline(plant: Plant): string {
  const taglines: Record<PlantPersonality, string> = {
    "drama-queen": "Always demanding attention",
    "low-maintenance": "Easy-going and chill",
    "attention-seeker": "Loves the spotlight",
    "silent-treatment": "Quietly thriving",
    "main-character": "Center of attention",
    "chill-vibes": "Just vibing",
  };
  return taglines[plant.personality ?? "chill-vibes"] || "Living its best life";
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function calculateLevel(xp: number): { level: number; levelName: string; progress: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const progress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  return { level, levelName, progress };
}

// Default values
export const DEFAULT_PROFILE: UserProfile = {
  id: "default",
  username: "Plant Parent",
  experienceLevel: "beginner",
  xp: 0,
  totalXP: 0,
  level: 1,
  levelName: "Seedling",
  streakDays: 0,
  currentStreak: 0,
  totalPlantsAdded: 0,
  totalTasksCompleted: 0,
  tasksCompleted: 0,
  lastActiveDate: new Date().toISOString(),
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  notifications: true,
  notificationsEnabled: true,
  morningReminders: true,
  weeklySummaries: true,
  highContrast: false,
  reducedMotion: false,
  hapticFeedbackEnabled: true,
  reminderTime: "09:00",
  onboardingCompleted: false,
  preferredUnits: "metric",
  units: "metric",
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-bloom",
    name: "First Bloom",
    description: "Add your first plant",
    icon: "🌱",
  },
  {
    id: "green-thumb",
    name: "Green Thumb",
    description: "Complete 50 care tasks",
    icon: "👍",
  },
  {
    id: "jungle-king",
    name: "Jungle King",
    description: "Own 10 plants",
    icon: "👑",
  },
];