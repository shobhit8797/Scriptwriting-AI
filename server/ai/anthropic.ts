import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key",
});

interface ScriptGenerationOptions {
  title: string;
  instructions: string;
  structure?: string;
  tone: string;
  length: number; // 1-3 (short, medium, long)
  previousIterations?: string[];
  reduceRedundancy?: boolean;
  enhanceClarity?: boolean;
  improveEngagement?: boolean;
}

export async function generateScript(options: ScriptGenerationOptions): Promise<string> {
  const {
    title,
    instructions,
    structure,
    tone,
    length,
    previousIterations = [],
    reduceRedundancy = true,
    enhanceClarity = true,
    improveEngagement = true,
  } = options;

  const lengthDescription = length === 1 ? "short (around 3 minutes)" : 
                           length === 2 ? "medium (around 7 minutes)" : 
                           "long (around 12 minutes)";

  // Define system prompt based on iteration
  let systemPrompt = "You are an expert YouTube scriptwriter.";
  
  if (previousIterations.length === 0) {
    // First iteration
    systemPrompt += ` Create a ${lengthDescription} YouTube script based on the instructions provided. Use appropriate formatting with sections, timestamps, and speaker notes.`;
  } else {
    // Refinement iterations
    systemPrompt += " Refine the previous script version to improve quality:";
    
    if (reduceRedundancy) {
      systemPrompt += "\n- Reduce redundancy and repetition";
    }
    
    if (enhanceClarity) {
      systemPrompt += "\n- Enhance clarity and coherence";
    }
    
    if (improveEngagement) {
      systemPrompt += "\n- Improve engagement and flow";
    }
    
    systemPrompt += "\n\nMaintain the same general structure but improve the content.";
  }

  // Create user message
  let userMessage = `Title: ${title}\n\nInstructions: ${instructions}\n\nTone: ${tone}\n\nDesired Length: ${lengthDescription}`;
  
  if (structure) {
    userMessage += `\n\nStructure: ${structure}`;
  }

  // Add previous iterations for context if this is a refinement
  if (previousIterations.length > 0) {
    userMessage += `\n\nPrevious iteration to refine:\n\n${previousIterations[previousIterations.length - 1]}`;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 4000,
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Error generating script with Anthropic:", error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function analyzeScript(script: string): Promise<{
  wordCount: number;
  estimatedDuration: number;
  readabilityScore?: number;
}> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "Analyze the YouTube script and provide metrics as JSON with the following keys: wordCount (number), estimatedDuration (in seconds), readabilityScore (1-10 scale with 10 being most readable).",
      max_tokens: 1024,
      messages: [
        { role: 'user', content: script }
      ],
    });

    // Try to parse the response as JSON
    const jsonMatch = response.content[0].text.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        return {
          wordCount: result.wordCount || script.split(/\s+/).length,
          estimatedDuration: result.estimatedDuration || Math.round(script.split(/\s+/).length / 150 * 60),
          readabilityScore: result.readabilityScore,
        };
      } catch (parseError) {
        console.error("Error parsing JSON from Anthropic response:", parseError);
      }
    }
    
    // Fallback to basic analysis
    const wordCount = script.split(/\s+/).length;
    const estimatedDuration = Math.round(wordCount / 150 * 60); // 150 words per minute estimate
    
    return {
      wordCount,
      estimatedDuration,
    };
  } catch (error) {
    console.error("Error analyzing script with Anthropic:", error);
    
    // Basic fallback analysis
    const wordCount = script.split(/\s+/).length;
    const estimatedDuration = Math.round(wordCount / 150 * 60);
    
    return {
      wordCount,
      estimatedDuration,
    };
  }
}

export async function compareScripts(originalScript: string, revisedScript: string): Promise<{
  redundancyReduction: number;
  improvementAreas: string[];
}> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "Compare the original and revised YouTube scripts. Calculate the redundancy reduction percentage and identify key improvement areas. Format your response as JSON with keys: 'redundancyReduction' (number) and 'improvementAreas' (string array).",
      max_tokens: 1024,
      messages: [
        { role: 'user', content: `Original script:\n\n${originalScript}\n\nRevised script:\n\n${revisedScript}` }
      ],
    });

    // Try to parse the response as JSON
    const jsonMatch = response.content[0].text.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        return {
          redundancyReduction: result.redundancyReduction || 0,
          improvementAreas: result.improvementAreas || [],
        };
      } catch (parseError) {
        console.error("Error parsing JSON from Anthropic response:", parseError);
      }
    }
    
    // Fallback
    return {
      redundancyReduction: 0,
      improvementAreas: ["Error analyzing improvements"],
    };
  } catch (error) {
    console.error("Error comparing scripts with Anthropic:", error);
    return {
      redundancyReduction: 0,
      improvementAreas: ["Error analyzing improvements"],
    };
  }
}
