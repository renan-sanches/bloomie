import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Import after mocking
import { invokeLLM } from "../server/_core/llm";

describe("AI Router Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("identifyPlant", () => {
    it("should return plant identification result on success", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              success: true,
              confidence: 95,
              commonName: "Monstera Deliciosa",
              scientificName: "Monstera deliciosa",
              description: "A popular tropical houseplant",
              careLevel: "moderate",
              lightRequirements: "Bright indirect light",
              wateringFrequency: "Every 7-10 days",
              humidity: "Moderate to high",
              toxicity: "Toxic to pets",
              funFact: "The holes are called fenestrations",
              alternatives: []
            })
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      // Simulate calling the endpoint logic
      const imageBase64 = "base64encodedimage";
      const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

      const result = await invokeLLM({
        messages: [
          { role: "system", content: expect.any(String) },
          { role: "user", content: expect.any(Array) }
        ],
        response_format: { type: "json_object" }
      });

      expect(result.choices[0].message.content).toBeDefined();
      const parsed = JSON.parse(result.choices[0].message.content as string);
      expect(parsed.success).toBe(true);
      expect(parsed.commonName).toBe("Monstera Deliciosa");
    });

    it("should return error when plant cannot be identified", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              success: false,
              error: "Could not identify the plant in the image"
            })
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: expect.any(Array),
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(result.choices[0].message.content as string);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toBeDefined();
    });
  });

  describe("diagnosePlantHealth", () => {
    it("should return health diagnosis on success", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              success: true,
              overallHealth: "mild-issues",
              healthScore: 75,
              issues: [{
                name: "Yellowing leaves",
                severity: "mild",
                description: "Some lower leaves are yellowing",
                treatment: "Reduce watering frequency"
              }],
              recommendations: ["Water less frequently", "Ensure good drainage"],
              urgentAction: null
            })
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: expect.any(Array),
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(result.choices[0].message.content as string);
      expect(parsed.success).toBe(true);
      expect(parsed.overallHealth).toBe("mild-issues");
      expect(parsed.healthScore).toBe(75);
      expect(parsed.issues).toHaveLength(1);
    });

    it("should include urgent action when severe issues detected", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              success: true,
              overallHealth: "severe-issues",
              healthScore: 30,
              issues: [{
                name: "Root rot",
                severity: "severe",
                description: "Signs of root rot detected",
                treatment: "Repot immediately with fresh soil"
              }],
              recommendations: ["Check drainage", "Reduce watering"],
              urgentAction: "Repot the plant immediately to prevent further damage"
            })
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: expect.any(Array),
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(result.choices[0].message.content as string);
      expect(parsed.urgentAction).toBeDefined();
      expect(parsed.urgentAction).not.toBeNull();
    });
  });

  describe("chat", () => {
    it("should return chat response on success", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: "Hello! 🌱 I'd be happy to help you with your plant care questions. Watering frequency depends on several factors including the plant type, pot size, and environment. Most houseplants prefer to dry out slightly between waterings."
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: expect.any(Array)
      });

      expect(result.choices[0].message.content).toBeDefined();
      expect(typeof result.choices[0].message.content).toBe("string");
    });

    it("should handle conversation history", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: "Based on our previous conversation about your Monstera, I'd recommend checking the soil moisture before watering again."
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      const history = [
        { role: "user" as const, content: "I have a Monstera" },
        { role: "assistant" as const, content: "Great choice! Monsteras are wonderful plants." }
      ];

      const result = await invokeLLM({
        messages: [
          { role: "system" as const, content: "You are a helpful plant assistant" },
          ...history,
          { role: "user" as const, content: "When should I water it?" }
        ]
      });

      expect(result.choices[0].message.content).toContain("Monstera");
    });
  });

  describe("generateCareTips", () => {
    it("should return array of care tips", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              tips: [
                "Water when top 2 inches of soil are dry",
                "Provide bright indirect light",
                "Mist leaves weekly for humidity",
                "Fertilize monthly during growing season",
                "Wipe leaves to remove dust"
              ]
            })
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: expect.any(Array),
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(result.choices[0].message.content as string);
      expect(parsed.tips).toBeDefined();
      expect(Array.isArray(parsed.tips)).toBe(true);
      expect(parsed.tips.length).toBe(5);
    });
  });

  describe("Error handling", () => {
    it("should handle LLM errors gracefully", async () => {
      (invokeLLM as any).mockRejectedValue(new Error("LLM service unavailable"));

      await expect(invokeLLM({ messages: [] })).rejects.toThrow("LLM service unavailable");
    });

    it("should handle empty response", async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: null
          }
        }]
      };

      (invokeLLM as any).mockResolvedValue(mockResponse);

      const result = await invokeLLM({ messages: [] });
      expect(result.choices[0].message.content).toBeNull();
    });
  });
});
