import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the GoogleGenAI module
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          success: true,
          confidence: 95,
          commonName: "Monstera Deliciosa",
          scientificName: "Monstera deliciosa",
          description: "A popular tropical houseplant known for its distinctive split leaves.",
          careLevel: "moderate",
          lightRequirements: "Bright indirect light",
          wateringFrequency: "Every 7-10 days",
          humidity: "Moderate to high",
          toxicity: "Toxic to pets",
          funFact: "The holes in Monstera leaves are called fenestrations.",
          alternatives: [
            { commonName: "Split-leaf Philodendron", scientificName: "Thaumatophyllum bipinnatifidum", confidence: 75 }
          ]
        }),
      }),
      generateContentStream: vi.fn().mockImplementation(async function* () {
        yield { text: "Hello! " };
        yield { text: "I'm Bloomie, " };
        yield { text: "your plant care assistant." };
      }),
    },
  })),
}));

// Set mock API key
process.env.GEMINI_API_KEY = "test-api-key";

// Import after mocking
import {
  identifyPlant,
  diagnosePlantHealth,
  chatWithBloomie,
  generateCareTips,
  type PlantIdentificationResult,
  type HealthDiagnosisResult,
} from "./gemini-service";

describe("Gemini Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("identifyPlant", () => {
    it("should return plant identification result with expected structure", async () => {
      const mockBase64 = "base64encodedimage";
      const result = await identifyPlant(mockBase64);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.commonName).toBe("Monstera Deliciosa");
      expect(result.scientificName).toBe("Monstera deliciosa");
      expect(result.confidence).toBe(95);
      expect(result.careLevel).toBe("moderate");
      expect(result.lightRequirements).toBeDefined();
      expect(result.wateringFrequency).toBeDefined();
    });

    it("should include alternatives in the result", async () => {
      const mockBase64 = "base64encodedimage";
      const result = await identifyPlant(mockBase64);

      expect(result.alternatives).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
      if (result.alternatives && result.alternatives.length > 0) {
        expect(result.alternatives[0].commonName).toBeDefined();
        expect(result.alternatives[0].confidence).toBeDefined();
      }
    });
  });

  describe("diagnosePlantHealth", () => {
    it("should return health diagnosis result", async () => {
      // Re-mock for health diagnosis
      const { GoogleGenAI } = await import("@google/genai");
      (GoogleGenAI as any).mockImplementation(() => ({
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              success: true,
              overallHealth: "mild-issues",
              healthScore: 75,
              issues: [
                {
                  name: "Yellowing leaves",
                  severity: "mild",
                  description: "Some lower leaves are yellowing",
                  treatment: "Reduce watering frequency",
                }
              ],
              recommendations: ["Water less frequently", "Ensure good drainage"],
              urgentAction: null,
            }),
          }),
        },
      }));

      const mockBase64 = "base64encodedimage";
      const result = await diagnosePlantHealth(mockBase64, "Monstera");

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.overallHealth).toBeDefined();
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe("chatWithBloomie", () => {
    it("should return a chat response", async () => {
      const message = "How often should I water my Monstera?";
      const history: { role: "user" | "assistant"; content: string }[] = [];
      
      const response = await chatWithBloomie(message, history);

      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });

    it("should accept user context", async () => {
      const message = "How are my plants doing?";
      const history: { role: "user" | "assistant"; content: string }[] = [];
      const context = {
        plants: [
          { nickname: "Monty", species: "Monstera", healthScore: 85 },
          { nickname: "Fernie", species: "Boston Fern", healthScore: 70 },
        ],
        pendingTasks: 3,
        streakDays: 7,
      };

      const response = await chatWithBloomie(message, history, context);

      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
    });
  });

  describe("generateCareTips", () => {
    it("should return an array of care tips", async () => {
      // Re-mock for care tips
      const { GoogleGenAI } = await import("@google/genai");
      (GoogleGenAI as any).mockImplementation(() => ({
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify([
              "Water when top 2 inches of soil are dry",
              "Provide bright indirect light",
              "Mist leaves weekly for humidity",
              "Fertilize monthly during growing season",
              "Wipe leaves to remove dust",
            ]),
          }),
        },
      }));

      const tips = await generateCareTips("Monstera", "Monstera deliciosa");

      expect(tips).toBeDefined();
      expect(Array.isArray(tips)).toBe(true);
      expect(tips.length).toBeGreaterThan(0);
    });
  });

  describe("PlantIdentificationResult type", () => {
    it("should have correct structure", () => {
      const result: PlantIdentificationResult = {
        success: true,
        confidence: 90,
        commonName: "Test Plant",
        scientificName: "Testus plantus",
        description: "A test plant",
        careLevel: "easy",
        lightRequirements: "Low light",
        wateringFrequency: "Weekly",
        humidity: "Low",
        toxicity: "Non-toxic",
        funFact: "This is a test",
      };

      expect(result.success).toBe(true);
      expect(result.careLevel).toMatch(/^(easy|moderate|expert)$/);
    });
  });

  describe("HealthDiagnosisResult type", () => {
    it("should have correct structure", () => {
      const result: HealthDiagnosisResult = {
        success: true,
        overallHealth: "healthy",
        healthScore: 100,
        issues: [],
        recommendations: ["Keep up the good work!"],
      };

      expect(result.success).toBe(true);
      expect(result.overallHealth).toMatch(/^(healthy|mild-issues|moderate-issues|severe-issues)$/);
      expect(result.healthScore).toBe(100);
    });
  });
});
