import { createContext, useContext } from "react";

// Types
export interface Plant {
  id: string;
  nickname: string;
  species: string;
  scientificName?: string;
  photo?: string;
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
  hydrationLevel: number;
  lightExposure: number;
  humidityLevel: number;
  personality: PlantPersonality;
  notes: string[];
  photos: PlantPhoto[];
  careHistory: CareEvent[];
  diagnosisHistory: Diagnosis[];
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

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  expiresAt: string;
  completed: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  experienceLevel: "beginner" | "growing" | "expert";