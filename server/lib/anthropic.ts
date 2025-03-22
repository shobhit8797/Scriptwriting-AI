import Anthropic from '@anthropic-ai/sdk';
import { AIService, ScriptParams, createInitialPrompt, createImprovementPrompt } from "./ai-service";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. Do not change this unless explicitly requested by the user.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
});

export const anthropicService: AIService = {
  async generateScript(params: ScriptParams): Promise<string> {
    const prompt = createInitialPrompt(params);
    
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: getMaxTokensByLength(params.length),
        messages: [{ role: 'user', content: prompt }],
      });

      return response.content[0].text;
    } catch (error) {
      console.error("Claude script generation error:", error);
      throw new Error("Failed to generate script with Claude");
    }
  },

  async improveScript(params: ScriptParams): Promise<{ content: string; improvements: string }> {
    if (!params.previousContent) {
      throw new Error("Previous content is required for script improvement");
    }

    const prompt = createImprovementPrompt(params);
    
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: getMaxTokensByLength(params.length),
        messages: [{ role: 'user', content: prompt }],
      });

      const result = response.content[0].text;
      
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
      console.error("Claude script improvement error:", error);
      throw new Error("Failed to improve script with Claude");
    }
  }
};

// Helper to determine max tokens based on script length
function getMaxTokensByLength(length: string): number {
  switch (length) {
    case 'short':
      return 3000; // ~3-5 min
    case 'medium':
      return 6000; // ~8-12 min
    case 'long':
      return 9000; // ~15+ min
    default:
      return 6000; // default to medium
  }
}
