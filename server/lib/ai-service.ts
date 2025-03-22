import { openaiService } from './openai';
import { anthropicService } from './anthropic';
import { ScriptStructure } from '@shared/schema';

// Define supported AI models
export type AIModel = 'gpt-4o' | 'claude-3-7-sonnet-20250219' | 'grok';

// Script generation parameters
export interface ScriptParams {
  title: string;
  description: string;
  length: string;
  tone: string;
  style: string;
  structure: ScriptStructure;
  modelName: AIModel;
  iterationNumber: number;
  previousContent?: string;
}

// AI service interface
export interface AIService {
  generateScript(params: ScriptParams): Promise<string>;
  improveScript(params: ScriptParams): Promise<{ content: string; improvements: string }>;
}

// AI service factory
export const getAIService = (model: AIModel): AIService => {
  switch (model) {
    case 'gpt-4o':
      return openaiService;
    case 'claude-3-7-sonnet-20250219':
      return anthropicService;
    case 'grok':
      // In a real app, this would be implemented as well
      // For now, return OpenAI as a fallback
      console.warn("Grok model not implemented, falling back to OpenAI");
      return openaiService;
    default:
      return openaiService;
  }
};

// Helper to create a prompt for script generation
export const createInitialPrompt = (params: ScriptParams): string => {
  const { title, description, length, tone, style, structure } = params;
  
  const structureItems = Object.entries(structure)
    .filter(([_, included]) => included)
    .map(([key, _]) => `- ${formatStructureKey(key)}`)
    .join('\n');
    
  return `
Create a YouTube script for a video titled "${title}".

SCRIPT DETAILS:
${description}

PARAMETERS:
- Length: ${length}
- Tone: ${tone}
- Style: ${style}

STRUCTURE:
Include the following elements:
${structureItems}

FORMAT:
- Format sections with clear headings
- Add estimated timestamps for each section
- Make the script conversational and engaging for a YouTube audience
- Avoid redundancy and repetitive phrases
- Focus on clear, concise explanations
- Use natural language that would work well when spoken aloud
  
Please create a complete, ready-to-use script.
`;
};

// Helper to create a prompt for script improvement
export const createImprovementPrompt = (params: ScriptParams): string => {
  const { title, previousContent, iterationNumber } = params;
  
  const improvementFocus = [
    "Focus on reducing any redundancy or repetitive phrases.",
    "Improve the flow between sections and strengthen transitions.",
    "Enhance the language variety and incorporate higher-impact phrases.",
    "Final polish: optimize for engagement and ensure natural speech patterns."
  ][iterationNumber - 1] || "Improve the overall quality of the script.";
  
  return `
You are improving a YouTube script titled "${title}" for iteration #${iterationNumber}.

PREVIOUS SCRIPT:
${previousContent}

IMPROVEMENT FOCUS:
${improvementFocus}

Your task is to improve this script while maintaining its structure and key points.
Analyze the previous script and make targeted improvements to enhance quality.
Provide a summary of improvements you've made.

OUTPUT FORMAT:
1. First provide the complete improved script
2. Then add "IMPROVEMENTS:" followed by a bullet list of specific changes you made

Please do not just make minor word changes - make meaningful improvements to the structure, flow, and impact of the script.
`;
};

// Helper function to format structure keys
function formatStructureKey(key: string): string {
  // Convert camelCase to spaces and capitalize
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}
