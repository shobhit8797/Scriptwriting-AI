import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  structure: text("structure"),
  aiModel: text("ai_model").notNull(),
  tone: text("tone").notNull(),
  length: integer("length").notNull(),
  iterations: integer("iterations").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  settings: jsonb("settings"),
});

export const scriptIterations = pgTable("script_iterations", {
  id: serial("id").primaryKey(),
  scriptId: integer("script_id").references(() => scripts.id).notNull(),
  iterationNumber: integer("iteration_number").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull(), // 'in_progress', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  metrics: jsonb("metrics"), // store metrics like redundancy reduction percentage
});

// Schema definitions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
});

export const insertScriptIterationSchema = createInsertSchema(scriptIterations).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

export type InsertScriptIteration = z.infer<typeof insertScriptIterationSchema>;
export type ScriptIteration = typeof scriptIterations.$inferSelect;

// Custom types for frontend use
export const scriptSettingsSchema = z.object({
  reduceRedundancy: z.boolean().default(true),
  enhanceClarity: z.boolean().default(true),
  improveEngagement: z.boolean().default(true),
});

export type ScriptSettings = z.infer<typeof scriptSettingsSchema>;

export const scriptMetricsSchema = z.object({
  redundancyReduction: z.number().optional(),
  wordCount: z.number().optional(),
  estimatedDuration: z.number().optional(),
  readabilityScore: z.number().optional(),
});

export type ScriptMetrics = z.infer<typeof scriptMetricsSchema>;

// Script creation form schema with validations
export const createScriptSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  structure: z.string().optional(),
  aiModel: z.string(),
  tone: z.string(),
  length: z.number().min(1).max(3),
  iterations: z.number().min(2).max(4),
  settings: scriptSettingsSchema,
});

export type CreateScriptInput = z.infer<typeof createScriptSchema>;

// Export settings schema
export const exportSettingsSchema = z.object({
  format: z.enum(["google_docs", "word", "text", "markdown"]),
  includeMetadata: z.boolean().default(true),
  includeTimestamps: z.boolean().default(true),
  includeSections: z.boolean().default(true),
  formatForTalent: z.boolean().default(false),
  enableSharing: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  email: z.string().email().optional(),
});

export type ExportSettings = z.infer<typeof exportSettingsSchema>;
