import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { invokeLLM, type TextContent, type ImageContent, type FileContent } from "./_core/llm";

// Helper to extract text content from LLM response
function extractTextContent(content: string | Array<TextContent | ImageContent | FileContent>): string {
  if (typeof content === "string") {
    return content;
  }
  return content
    .map(part => (part.type === "text" ? part.text : ""))
    .join("");
}

// Chat message schema
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const aiRouter = router({
  // Plant identification endpoint
  identifyPlant: publicProcedure
    .input(z.object({
      imageBase64: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Convert base64 to data URL for the LLM
        const imageUrl = input.imageBase64.startsWith("data:")
          ? input.imageBase64
          : `data:image/jpeg;base64,${input.imageBase64}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert botanist and plant identification specialist. Analyze the plant image and provide detailed identification.

Return your response as a JSON object with this exact structure:
{
  "success": true,
  "confidence": <number 0-100>,
  "commonName": "<common name>",
  "scientificName": "<scientific name>",
  "description": "<brief description of the plant>",
  "careLevel": "<easy|moderate|expert>",
  "lightRequirements": "<light needs>",
  "wateringFrequency": "<how often to water>",
  "humidity": "<humidity preferences>",
  "toxicity": "<toxic to pets/humans or non-toxic>",
  "funFact": "<interesting fact about this plant>",
  "alternatives": [
    {"commonName": "<name>", "scientificName": "<name>", "confidence": <number>}
  ]
}

If you cannot identify the plant or the image doesn't show a plant, return:
{"success": false, "error": "<reason>"}`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Please identify this plant and provide care information." },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          return { success: false, error: "No response from AI" };
        }

        const content = extractTextContent(rawContent);
        const result = JSON.parse(content);
        return result;
      } catch (error) {
        console.error("Plant identification error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to identify plant",
        };
      }
    }),

  // Health diagnosis endpoint
  diagnosePlantHealth: publicProcedure
    .input(z.object({
      imageBase64: z.string(),
      plantName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const imageUrl = input.imageBase64.startsWith("data:")
          ? input.imageBase64
          : `data:image/jpeg;base64,${input.imageBase64}`;

        const plantContext = input.plantName
          ? `The plant is identified as: ${input.plantName}.`
          : "The plant species is unknown.";

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert plant pathologist. Analyze the plant image for health issues.

${plantContext}

Return your response as a JSON object with this exact structure:
{
  "success": true,
  "overallHealth": "<healthy|mild-issues|moderate-issues|severe-issues>",
  "healthScore": <number 0-100>,
  "issues": [
    {
      "name": "<issue name>",
      "severity": "<mild|moderate|severe>",
      "description": "<what you observe>",
      "treatment": "<how to fix it>"
    }
  ],
  "recommendations": ["<general care tip 1>", "<tip 2>"],
  "urgentAction": "<immediate action needed or null if none>"
}

If you cannot analyze the image, return:
{"success": false, "error": "<reason>"}`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Please diagnose this plant's health and identify any issues." },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          return { success: false, error: "No response from AI" };
        }

        const content = extractTextContent(rawContent);
        const result = JSON.parse(content);
        return result;
      } catch (error) {
        console.error("Health diagnosis error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to diagnose plant health",
        };
      }
    }),

  // Chat with Bloomie Buddy
  chat: publicProcedure
    .input(z.object({
      message: z.string(),
      history: z.array(chatMessageSchema).optional(),
      context: z.object({
        plants: z.array(z.object({
          nickname: z.string(),
          species: z.string(),
          healthScore: z.number(),
        })).optional(),
        pendingTasks: z.number().optional(),
        streakDays: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Build context string
        let contextInfo = "";
        if (input.context) {
          if (input.context.plants && input.context.plants.length > 0) {
            contextInfo += `\nUser's plants: ${input.context.plants.map(p => `${p.nickname} (${p.species}, health: ${p.healthScore}%)`).join(", ")}`;
          }
          if (input.context.pendingTasks !== undefined) {
            contextInfo += `\nPending care tasks: ${input.context.pendingTasks}`;
          }
          if (input.context.streakDays !== undefined) {
            contextInfo += `\nCare streak: ${input.context.streakDays} days`;
          }
        }

        // Build conversation history
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          {
            role: "system",
            content: `You are Bloomie, a friendly and knowledgeable AI plant care assistant. You're warm, encouraging, and passionate about helping people care for their plants.

Your personality:
- Use plant-related emojis occasionally (🌱🌿🪴💚)
- Be encouraging and supportive, especially for beginners
- Give practical, actionable advice
- Share interesting plant facts when relevant
- Keep responses concise but helpful (2-3 paragraphs max)
- If asked about non-plant topics, gently redirect to plant care
${contextInfo ? `\nUser context:${contextInfo}` : ""}`,
          },
        ];

        // Add conversation history
        if (input.history && input.history.length > 0) {
          for (const msg of input.history.slice(-10)) {
            messages.push({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            });
          }
        }

        // Add current message
        messages.push({
          role: "user",
          content: input.message,
        });

        const response = await invokeLLM({ messages });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          return { success: false, response: "I'm having trouble thinking right now. Let me try again!" };
        }

        const content = extractTextContent(rawContent);
        return { success: true, response: content };
      } catch (error) {
        console.error("Chat error:", error);
        return {
          success: false,
          response: "Oops! I'm having a moment. Let me collect my thoughts and try again. 🌿",
        };
      }
    }),

  // Generate care tips for a specific plant
  generateCareTips: publicProcedure
    .input(z.object({
      commonName: z.string(),
      scientificName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert botanist. Generate 5 practical care tips for the specified plant.

Return your response as a JSON object with a "tips" array:
{"tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]}

Keep each tip concise (1-2 sentences) and actionable.`,
            },
            {
              role: "user",
              content: `Generate care tips for: ${input.commonName}${input.scientificName ? ` (${input.scientificName})` : ""}`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          return { success: false, tips: [] };
        }

        const content = extractTextContent(rawContent);

        // Parse the response
        let tips: string[];
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          tips = parsed;
        } else if (parsed.tips && Array.isArray(parsed.tips)) {
          tips = parsed.tips;
        } else {
          tips = Object.values(parsed).filter((v): v is string => typeof v === "string");
        }

        return { success: true, tips };
      } catch (error) {
        console.error("Generate care tips error:", error);
        return { success: false, tips: [] };
      }
    }),
});
