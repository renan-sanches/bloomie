import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }
  return new GoogleGenAI({ apiKey });
};

export interface PlantIdentificationResult {
  success: boolean;
  confidence: number;
  commonName: string;
  scientificName: string;
  description: string;
  careLevel: "easy" | "moderate" | "expert";
  lightRequirements: string;
  wateringFrequency: string;
  humidity: string;
  toxicity: string;
  funFact: string;
  alternatives?: Array<{
    commonName: string;
    scientificName: string;
    confidence: number;
  }>;
  error?: string;
}

export interface HealthDiagnosisResult {
  success: boolean;
  overallHealth: "healthy" | "mild-issues" | "moderate-issues" | "severe-issues";
  healthScore: number;
  issues: Array<{
    name: string;
    severity: "mild" | "moderate" | "severe";
    description: string;
    treatment: string;
  }>;
  recommendations: string[];
  urgentAction?: string;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Identify a plant from an image using Gemini Vision
 */
export async function identifyPlant(imageBase64: string): Promise<PlantIdentificationResult> {
  try {
    const client = getGeminiClient();

    const prompt = `You are an expert botanist. Analyze this plant image and provide identification.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "success": true,
  "confidence": <number 0-100>,
  "commonName": "<common name>",
  "scientificName": "<scientific name>",
  "description": "<brief 1-2 sentence description>",
  "careLevel": "<easy|moderate|expert>",
  "lightRequirements": "<e.g., bright indirect light>",
  "wateringFrequency": "<e.g., every 7-10 days>",
  "humidity": "<e.g., moderate to high>",
  "toxicity": "<e.g., toxic to pets, or non-toxic>",
  "funFact": "<interesting fact about this plant>",
  "alternatives": [
    {"commonName": "<name>", "scientificName": "<name>", "confidence": <number>}
  ]
}

If you cannot identify the plant or the image doesn't show a plant, return:
{"success": false, "error": "<reason>"}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || "";
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Failed to parse AI response", confidence: 0, commonName: "", scientificName: "", description: "", careLevel: "moderate", lightRequirements: "", wateringFrequency: "", humidity: "", toxicity: "", funFact: "" };
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Plant identification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      confidence: 0,
      commonName: "",
      scientificName: "",
      description: "",
      careLevel: "moderate",
      lightRequirements: "",
      wateringFrequency: "",
      humidity: "",
      toxicity: "",
      funFact: "",
    };
  }
}

/**
 * Diagnose plant health issues from an image using Gemini Vision
 */
export async function diagnosePlantHealth(
  imageBase64: string,
  plantName?: string
): Promise<HealthDiagnosisResult> {
  try {
    const client = getGeminiClient();

    const plantContext = plantName ? `This is a ${plantName}.` : "Identify the plant first if possible.";

    const prompt = `You are an expert plant pathologist. Analyze this plant image for health issues.
${plantContext}

Look for signs of:
- Yellowing or browning leaves
- Wilting or drooping
- Spots, lesions, or discoloration
- Pest damage or visible pests
- Root rot signs
- Nutrient deficiencies
- Overwatering or underwatering

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "success": true,
  "overallHealth": "<healthy|mild-issues|moderate-issues|severe-issues>",
  "healthScore": <number 0-100>,
  "issues": [
    {
      "name": "<issue name>",
      "severity": "<mild|moderate|severe>",
      "description": "<what you observed>",
      "treatment": "<how to fix it>"
    }
  ],
  "recommendations": ["<general care tip 1>", "<tip 2>"],
  "urgentAction": "<immediate action needed, or null if none>"
}

If the image doesn't show a plant clearly, return:
{"success": false, "error": "<reason>"}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Failed to parse AI response", overallHealth: "healthy", healthScore: 0, issues: [], recommendations: [] };
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Health diagnosis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      overallHealth: "healthy",
      healthScore: 0,
      issues: [],
      recommendations: [],
    };
  }
}

/**
 * Chat with Bloomie Buddy AI about plant care
 */
export async function chatWithBloomie(
  message: string,
  conversationHistory: ChatMessage[],
  userContext?: {
    plants?: Array<{ nickname: string; species: string; healthScore: number }>;
    pendingTasks?: number;
    streakDays?: number;
  }
): Promise<string> {
  try {
    const client = getGeminiClient();

    const contextInfo = userContext
      ? `
User's plant collection: ${userContext.plants?.map((p) => `${p.nickname} (${p.species}, health: ${p.healthScore}%)`).join(", ") || "No plants yet"}
Pending care tasks: ${userContext.pendingTasks || 0}
Current streak: ${userContext.streakDays || 0} days
`
      : "";

    const systemPrompt = `You are Bloomie Buddy, a friendly and knowledgeable plant care assistant in the Bloomie app. 

Your personality:
- Warm, encouraging, and slightly playful
- Use plant-related emoji sparingly (🌱🌿💧☀️🌸)
- Give practical, actionable advice
- Celebrate user's plant care wins
- Be empathetic when plants struggle
- Keep responses concise (2-3 short paragraphs max)

${contextInfo}

Respond naturally to the user's message. If they ask about specific plants in their collection, reference them by name. If they're struggling, be supportive. If they're doing well, celebrate with them!`;

    // Build conversation for Gemini
    const contents = [
      {
        role: "user" as const,
        parts: [{ text: systemPrompt + "\n\nConversation so far:\n" + conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n\nUser: " + message }],
      },
    ];

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return response.text || "I'm having trouble thinking right now. Could you try asking again? 🌱";
  } catch (error) {
    console.error("Chat error:", error);
    return "Oops! I'm having a moment. Let me collect my thoughts and try again. 🌿";
  }
}

/**
 * Stream chat responses for real-time display
 */
export async function* streamChatWithBloomie(
  message: string,
  conversationHistory: ChatMessage[],
  userContext?: {
    plants?: Array<{ nickname: string; species: string; healthScore: number }>;
    pendingTasks?: number;
    streakDays?: number;
  }
): AsyncGenerator<string, void, unknown> {
  try {
    const client = getGeminiClient();

    const contextInfo = userContext
      ? `
User's plant collection: ${userContext.plants?.map((p) => `${p.nickname} (${p.species}, health: ${p.healthScore}%)`).join(", ") || "No plants yet"}
Pending care tasks: ${userContext.pendingTasks || 0}
Current streak: ${userContext.streakDays || 0} days
`
      : "";

    const systemPrompt = `You are Bloomie Buddy, a friendly and knowledgeable plant care assistant in the Bloomie app. 

Your personality:
- Warm, encouraging, and slightly playful
- Use plant-related emoji sparingly (🌱🌿💧☀️🌸)
- Give practical, actionable advice
- Celebrate user's plant care wins
- Be empathetic when plants struggle
- Keep responses concise (2-3 short paragraphs max)

${contextInfo}

Respond naturally to the user's message. If they ask about specific plants in their collection, reference them by name.`;

    const contents = [
      {
        role: "user" as const,
        parts: [{ text: systemPrompt + "\n\nConversation so far:\n" + conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n\nUser: " + message }],
      },
    ];

    const response = await client.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Stream chat error:", error);
    yield "Oops! I'm having a moment. Let me collect my thoughts and try again. 🌿";
  }
}

/**
 * Generate personalized care tips for a specific plant
 */
export async function generateCareTips(
  plantName: string,
  scientificName?: string,
  currentIssues?: string[]
): Promise<string[]> {
  try {
    const client = getGeminiClient();

    const issuesContext = currentIssues?.length
      ? `Current issues: ${currentIssues.join(", ")}`
      : "No current issues reported.";

    const prompt = `Generate 5 personalized care tips for a ${plantName}${scientificName ? ` (${scientificName})` : ""}.
${issuesContext}

Return a JSON array of 5 short, actionable tips (no markdown, just raw JSON array):
["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]

Make tips specific to this plant species, not generic advice.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return ["Water when the top inch of soil is dry", "Provide bright indirect light", "Maintain moderate humidity"];
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Generate tips error:", error);
    return ["Water when the top inch of soil is dry", "Provide bright indirect light", "Maintain moderate humidity"];
  }
}
/**
 * Analyze growth progress between two plant photos
 */
export async function analyzeGrowthProgress(
  beforeImageBase64: string,
  afterImageBase64: string,
  plantName: string
): Promise<{ insight: string; growthDetected: boolean }> {
  try {
    const client = getGeminiClient();

    const prompt = `You are a plant enthusiast and expert. Compare these two images of the same plant named "${plantName}" taken at different times. 
    
    The first image is from the past, and the second image is from now. 
    Identify signs of growth, health changes, new leaves, or any other significant transformations.
    
    Provide a warm, encouraging, and detailed insight (2-3 sentences max). 
    Return as JSON:
    {
      "insight": "Your description here...",
      "growthDetected": true
    }`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: beforeImageBase64,
              },
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: afterImageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { insight: "Your plant is looking Great! I can see some healthy changes and growth.", growthDetected: true };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Growth analysis error:", error);
    return { insight: "Keep up the great work! Your plant is responding well to your care.", growthDetected: true };
  }
}
