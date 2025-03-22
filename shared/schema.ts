import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Script table to store script information
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  model: text("model").notNull(),
  length: text("length").notNull(),
  tone: text("tone").notNull(),
  style: text("style").notNull(),
  structure: jsonb("structure").notNull(),
  currentIteration: integer("current_iteration").default(0),
  totalIterations: integer("total_iterations").default(4),
  status: text("status").default("draft"),
  createdAt: text("created_at").notNull(),
});

// Iterations table to store different versions of the script
export const iterations = pgTable("iterations", {
  id: serial("id").primaryKey(),
  scriptId: integer("script_id").notNull(),
  iterationNumber: integer("iteration_number").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull(),
  improvements: text("improvements"),
  createdAt: text("created_at").notNull(),
});

// Script insert schema
export const insertScriptSchema = createInsertSchema(scripts)
  .omit({ id: true, currentIteration: true, totalIterations: true, status: true });

// Iteration insert schema
export const insertIterationSchema = createInsertSchema(iterations)
  .omit({ id: true });

// Script structure schema for validation
export const scriptStructureSchema = z.object({
  introduction: z.boolean().default(true),
  hook: z.boolean().default(true),
  mainPoints: z.boolean().default(true),
  examples: z.boolean().default(true),
  conclusion: z.boolean().default(true),
  callToAction: z.boolean().default(true),
});

// Export types
export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Iteration = typeof iterations.$inferSelect;
export type InsertIteration = z.infer<typeof insertIterationSchema>;
export type ScriptStructure = z.infer<typeof scriptStructureSchema>;
