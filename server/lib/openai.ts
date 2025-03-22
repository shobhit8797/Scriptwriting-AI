import OpenAI from "openai";
import { AIService, ScriptParams, createInitialPrompt, createImprovementPrompt } from "./ai-service";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
});

export const openaiService: AIService = {
  async generateScript(params: ScriptParams): Promise<string> {
    const prompt = createInitialPrompt(params);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: getMaxTokensByLength(params.length),
      });

      return response.choices[0].message.content || "Failed to generate script";
    } catch (error) {
      console.error("OpenAI script generation error:", error);
      throw new Error("Failed to generate script with OpenAI");
    }
  },

  async improveScript(params: ScriptParams): Promise<{ content: string; improvements: string }> {
    if (!params.previousContent) {
      throw new Error("Previous content is required for script improvement");
    }

    const prompt = createImprovementPrompt(params);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: getMaxTokensByLength(params.length),
      });

      const result = response.choices[0].message.content || "";
      
      // Split the result into content and improvements
      const improvementsIndex = result.indexOf("IMPROVEMENTS:");
      if (improvementsIndex === -1) {
        return { 
          content: result, 
          improvements: "No specific improvements listed." 
        };
      }
      
      const content = result.substring(0, improvementsIndex).trim();
      const improvements = result.substring(improvementsIndex).trim();
      
      return { content, improvements };
    } catch (error) {
      console.error("OpenAI script improvement error:", error);
      throw new Error("Failed to improve script with OpenAI");
    }
  }
};

// Helper to determine max tokens based on script length
function getMaxTokensByLength(length: string): number {
  switch (length) {
    case 'short':
      return 1500; // ~3-5 min
    case 'medium':
      return 3000; // ~8-12 min
    case 'long':
      return 4500; // ~15+ min
    default:
      return 3000; // default to medium
  }
}
