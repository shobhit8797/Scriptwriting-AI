import { z } from "zod";
import {
  ScriptSettings,
  ScriptMetrics,
  CreateScriptInput,
  ExportSettings,
  Script,
  ScriptIteration
} from "@shared/schema";

export type WizardStep = 'input' | 'generate' | 'review' | 'export';

export interface ScriptState {
  script?: Script;
  iterations: ScriptIteration[];
  currentStep: WizardStep;
  activeIterationId?: number;
  isLoading: boolean;
  error?: string;
}

export type ScriptTone = 
  | 'professional'
  | 'casual'
  | 'educational'
  | 'entertaining'
  | 'conversational'
  | 'inspirational';

export type AIModel = 
  | 'gpt-4'
  | 'gpt-3.5'
  | 'claude'
  | 'grok';

export interface IterationProgressInfo {
  iterationNumber: number;
  total: number;
  percentComplete: number;
  status: 'complete' | 'in-progress' | 'pending';
}

export interface ScriptAnalysis {
  wordCount: number;
  estimatedDuration: number;
  readabilityScore?: number;
  tone?: string[];
  structure?: string;
  redundancyReduction?: number;
}

export interface RefinementOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const exportFormSchema = z.object({
  format: z.enum(['google_docs', 'word', 'text', 'markdown']),
  includeMetadata: z.boolean().default(true),
  includeTimestamps: z.boolean().default(true),
  includeSections: z.boolean().default(true),
  formatForTalent: z.boolean().default(false),
  enableSharing: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  email: z.string().email().optional().or(z.literal('')),
});

export type ExportFormValues = z.infer<typeof exportFormSchema>;
