import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
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

  // Create system prompt based on iteration number
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

  // Create user prompt
  let userPrompt = `Title: ${title}\n\nInstructions: ${instructions}\n\nTone: ${tone}\n\nDesired Length: ${lengthDescription}`;
  
  if (structure) {
    userPrompt += `\n\nStructure: ${structure}`;
  }

  // Add previous iterations for context if this is a refinement
  if (previousIterations.length > 0) {
    userPrompt += `\n\nPrevious iteration to refine:\n\n${previousIterations[previousIterations.length - 1]}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0].message.content || "Failed to generate script.";
  } catch (error) {
    console.error("Error generating script with OpenAI:", error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function analyzeScript(script: string): Promise<{
  redundancyReduction?: number;
  wordCount: number;
  estimatedDuration: number;
  readabilityScore?: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the YouTube script and provide metrics in JSON format with the following fields: wordCount (number), estimatedDuration (in seconds), readabilityScore (1-10 scale with 10 being most readable)"
        },
        { role: "user", content: script }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      wordCount: result.wordCount || script.split(/\s+/).length,
      estimatedDuration: result.estimatedDuration || Math.round(script.split(/\s+/).length / 150 * 60), // Rough estimate: 150 words per minute
      readabilityScore: result.readabilityScore,
    };
  } catch (error) {
    console.error("Error analyzing script with OpenAI:", error);
    
    // Fallback to basic analysis if API fails
    const wordCount = script.split(/\s+/).length;
    const estimatedDuration = Math.round(wordCount / 150 * 60); // Rough estimate: 150 words per minute
    
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Compare the original and revised YouTube scripts. Calculate the redundancy reduction percentage and identify key improvement areas. Respond with JSON in this format: { 'redundancyReduction': number, 'improvementAreas': string[] }"
        },
        {
          role: "user",
          content: `Original script:\n\n${originalScript}\n\nRevised script:\n\n${revisedScript}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      redundancyReduction: result.redundancyReduction || 0,
      improvementAreas: result.improvementAreas || [],
    };
  } catch (error) {
    console.error("Error comparing scripts with OpenAI:", error);
    return {
      redundancyReduction: 0,
      improvementAreas: ["Error analyzing improvements"],
    };
  }
}
