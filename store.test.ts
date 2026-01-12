import { describe, it, expect } from "vitest";
import {
  generateId,
  calculateLevel,
  getGreeting,
  formatTimeAgo,
  getPlantStatus,
  getPersonalityTagline,
  LEVEL_NAMES,
  XP_PER_LEVEL,
  type Plant,
  type PlantPersonality,
} from "./store";

describe("generateId", () => {
  it("should generate a unique string ID", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(typeof id1).toBe("string");
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });
});

describe("calculateLevel", () => {
  it("should return level 1 for 0 XP", () => {
    const result = calculateLevel(0);
    expect(result.level).toBe(1);
    expect(result.levelName).toBe(LEVEL_NAMES[0]);
    expect(result.progress).toBe(0);
  });

  it("should return level 2 for XP_PER_LEVEL XP", () => {
    const result = calculateLevel(XP_PER_LEVEL);
    expect(result.level).toBe(2);
    expect(result.progress).toBe(0);
  });

  it("should calculate progress correctly", () => {
    const result = calculateLevel(XP_PER_LEVEL / 2);
    expect(result.level).toBe(1);
    expect(result.progress).toBeCloseTo(0.5, 1);
  });

  it("should cap at max level", () => {
    const result = calculateLevel(XP_PER_LEVEL * 100);
    expect(result.level).toBeLessThanOrEqual(LEVEL_NAMES.length);
  });
});

describe("getGreeting", () => {
  it("should return a string greeting", () => {
    const greeting = getGreeting();
    expect(typeof greeting).toBe("string");
    expect(greeting.length).toBeGreaterThan(0);
  });

  it("should contain appropriate time-based greeting", () => {
    const greeting = getGreeting();
    const validGreetings = ["Good morning", "Good afternoon", "Good evening"];
    const hasValidGreeting = validGreetings.some((g) => greeting.includes(g));
    expect(hasValidGreeting).toBe(true);
  });
});

describe("formatTimeAgo", () => {
  it("should return 'just now' for recent dates", () => {
    const now = new Date().toISOString();
    const result = formatTimeAgo(now);
    expect(result.toLowerCase()).toBe("just now");
  });

  it("should return minutes ago for dates within an hour", () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const result = formatTimeAgo(thirtyMinutesAgo);
    expect(result).toContain("m");
  });

  it("should return hours ago for dates within a day", () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    const result = formatTimeAgo(fiveHoursAgo);
    expect(result).toContain("h");
  });

  it("should return days ago for older dates", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatTimeAgo(threeDaysAgo);
    expect(result).toContain("d");
  });

  it("should handle string dates", () => {
    const dateString = new Date(Date.now() - 60000).toISOString();
    const result = formatTimeAgo(dateString);
    expect(result).toContain("m");
  });
});

describe("getPlantStatus", () => {
  const createMockPlant = (overrides: Partial<Plant> = {}): Plant => ({
    id: "test-plant",
    nickname: "Test Plant",
    species: "Test Species",
    dateAdded: new Date().toISOString(),
    healthScore: 80,
    hydrationLevel: 70,
    lightExposure: 60,
    humidityLevel: 50,
    wateringFrequencyDays: 7,
    mistingFrequencyDays: 3,
    fertilizingFrequencyDays: 30,
    rotatingFrequencyDays: 14,
    personality: "chill-vibes",
    notes: [],
    photos: [],
    careHistory: [],
    diagnosisHistory: [],
    ...overrides,
  });

  it("should return happy status for healthy plant", () => {
    // Plant with high health, high hydration, and recently watered
    const plant = createMockPlant({ 
      healthScore: 90, 
      hydrationLevel: 80,
      lastWatered: new Date().toISOString() // Just watered
    });
    const status = getPlantStatus(plant);
    expect(status.status).toBe("happy");
    expect(status.color).toBeDefined();
    expect(status.message).toBeDefined();
  });

  it("should return thirsty status for low hydration", () => {
    const plant = createMockPlant({ hydrationLevel: 20 });
    const status = getPlantStatus(plant);
    expect(status.status).toBe("thirsty");
  });

  it("should return needs-light status for low light exposure", () => {
    // Plant with good hydration but low light, and recently watered
    const plant = createMockPlant({ 
      hydrationLevel: 80, 
      lightExposure: 20,
      lastWatered: new Date().toISOString() // Just watered
    });
    const status = getPlantStatus(plant);
    expect(status.status).toBe("needs-light");
  });

  it("should return needs-attention status for low health score", () => {
    const plant = createMockPlant({ healthScore: 30, hydrationLevel: 80, lightExposure: 80 });
    const status = getPlantStatus(plant);
    expect(status.status).toBe("needs-attention");
  });
});

describe("getPersonalityTagline", () => {
  const createMockPlant = (personality: PlantPersonality): Plant => ({
    id: "test-plant",
    nickname: "Test Plant",
    species: "Test Species",
    dateAdded: new Date().toISOString(),
    healthScore: 80,
    hydrationLevel: 70,
    lightExposure: 60,
    humidityLevel: 50,
    wateringFrequencyDays: 7,
    mistingFrequencyDays: 3,
    fertilizingFrequencyDays: 30,
    rotatingFrequencyDays: 14,
    personality,
    notes: [],
    photos: [],
    careHistory: [],
    diagnosisHistory: [],
  });

  it("should return a tagline for chill-vibes personality", () => {
    const plant = createMockPlant("chill-vibes");
    const tagline = getPersonalityTagline(plant);
    expect(typeof tagline).toBe("string");
    expect(tagline.length).toBeGreaterThan(0);
  });

  it("should return a tagline for drama-queen personality", () => {
    const plant = createMockPlant("drama-queen");
    const tagline = getPersonalityTagline(plant);
    expect(typeof tagline).toBe("string");
    expect(tagline.length).toBeGreaterThan(0);
  });

  it("should return a tagline for low-maintenance personality", () => {
    const plant = createMockPlant("low-maintenance");
    const tagline = getPersonalityTagline(plant);
    expect(typeof tagline).toBe("string");
    expect(tagline.length).toBeGreaterThan(0);
  });

  it("should return a tagline for attention-seeker personality", () => {
    const plant = createMockPlant("attention-seeker");
    const tagline = getPersonalityTagline(plant);
    expect(typeof tagline).toBe("string");
    expect(tagline.length).toBeGreaterThan(0);
  });

  it("should return a tagline for silent-treatment personality", () => {
    const plant = createMockPlant("silent-treatment");
    const tagline = getPersonalityTagline(plant);
    expect(typeof tagline).toBe("string");
    expect(tagline.length).toBeGreaterThan(0);
  });

  it("should return a tagline for main-character personality", () => {
    const plant = createMockPlant("main-character");
    const tagline = getPersonalityTagline(plant);
    expect(typeof tagline).toBe("string");
    expect(tagline.length).toBeGreaterThan(0);
  });
});
