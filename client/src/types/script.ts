// Script-related types for the frontend

export type AIModel = 'gpt-4o' | 'claude-3-7-sonnet-20250219' | 'grok';

export type ScriptLength = 'short' | 'medium' | 'long';

export type ScriptTone = 
  | 'informative' 
  | 'casual' 
  | 'professional' 
  | 'enthusiastic';

export type ScriptStyle = 
  | 'tutorial' 
  | 'review' 
  | 'storytelling' 
  | 'explanatory';

export type ScriptStatus = 
  | 'draft' 
  | 'in_progress' 
  | 'completed';

export type IterationStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed';

export interface ScriptStructure {
  introduction: boolean;
  hook: boolean;
  mainPoints: boolean;
  examples: boolean;
  conclusion: boolean;
  callToAction: boolean;
}

export interface Script {
  id: number;
  title: string;
  description: string;
  model: AIModel;
  length: ScriptLength;
  tone: ScriptTone;
  style: ScriptStyle;
  structure: ScriptStructure;
  currentIteration: number;
  totalIterations: number;
  status: ScriptStatus;
  createdAt: string;
}

export interface ScriptIteration {
  id: number;
  scriptId: number;
  iterationNumber: number;
  content: string;
  status: IterationStatus;
  improvements?: string;
  createdAt: string;
}

export interface CreateScriptInput {
  title: string;
  description: string;
  model: AIModel;
  length: ScriptLength;
  tone: ScriptTone;
  style: ScriptStyle;
  structure: ScriptStructure;
}

export interface ExportOptions {
  format: 'gdocs' | 'word';
  includeTimestamps: boolean;
  formatSections: boolean;
  includeMetadata: boolean;
  addCameraNotes: boolean;
  fileName?: string;
  googleAccount?: string;
}

export const DEFAULT_SCRIPT_STRUCTURE: ScriptStructure = {
  introduction: true,
  hook: true,
  mainPoints: true,
  examples: true,
  conclusion: true,
  callToAction: true
};
