import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  createScriptSchema, 
  exportSettingsSchema, 
  insertScriptSchema, 
  insertScriptIterationSchema
} from "@shared/schema";
import * as openai from "./ai/openai";
import * as anthropic from "./ai/anthropic";
import { exportScript } from "./export/docx";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add error handling middleware to format validation errors
  app.use((err: unknown, req: Request, res: Response, next: Function) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: fromZodError(err).message,
      });
    }
    next(err);
  });

  // Script creation endpoint
  app.post('/api/scripts', async (req: Request, res: Response) => {
    try {
      const validatedData = createScriptSchema.parse(req.body);
      
      // Map the validated data to the script schema
      const scriptData = {
        userId: 1, // Default user ID for now, would be from auth in production
        title: validatedData.title,
        instructions: validatedData.instructions,
        structure: validatedData.structure || "",
        aiModel: validatedData.aiModel,
        tone: validatedData.tone,
        length: validatedData.length,
        iterations: validatedData.iterations,
        settings: validatedData.settings,
      };
      
      const script = await storage.createScript(scriptData);
      
      // Start the first iteration
      const iteration = await startScriptGeneration(script);
      
      res.status(201).json({ script, iteration });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Error creating script:", error);
        res.status(500).json({ message: "Failed to create script" });
      }
    }
  });

  // Get scripts endpoint
  app.get('/api/scripts', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Default user ID for now
      const scripts = await storage.getUserScripts(userId);
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      res.status(500).json({ message: "Failed to fetch scripts" });
    }
  });

  // Get specific script with all iterations
  app.get('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await storage.getScript(scriptId);
      
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      const iterations = await storage.getScriptIterations(scriptId);
      
      res.json({ script, iterations });
    } catch (error) {
      console.error("Error fetching script:", error);
      res.status(500).json({ message: "Failed to fetch script" });
    }
  });

  // Generate next iteration
  app.post('/api/scripts/:id/iterations', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await storage.getScript(scriptId);
      
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      const existingIterations = await storage.getScriptIterations(scriptId);
      const nextIterationNumber = existingIterations.length + 1;
      
      if (nextIterationNumber > script.iterations) {
        return res.status(400).json({ message: "Maximum iterations reached" });
      }
      
      const iteration = await generateNextIteration(script, existingIterations);
      
      res.status(201).json(iteration);
    } catch (error) {
      console.error("Error generating iteration:", error);
      res.status(500).json({ message: "Failed to generate iteration" });
    }
  });

  // Export script
  app.post('/api/scripts/:id/export', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      const settings = exportSettingsSchema.parse(req.body);
      
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      const iterations = await storage.getScriptIterations(scriptId);
      if (iterations.length === 0) {
        return res.status(400).json({ message: "No iterations to export" });
      }
      
      // Get the latest completed iteration
      const latestIteration = iterations
        .filter(it => it.status === 'completed')
        .sort((a, b) => b.iterationNumber - a.iterationNumber)[0];
      
      if (!latestIteration) {
        return res.status(400).json({ message: "No completed iterations to export" });
      }
      
      // Prepare metadata
      const metadata = {
        "Created": new Date().toLocaleDateString(),
        "AI Model": script.aiModel,
        "Tone": script.tone,
        "Iterations": latestIteration.iterationNumber,
      };
      
      // Generate the document content
      const content = exportScript(
        latestIteration.content,
        script.title,
        settings.format,
        settings,
        metadata
      );
      
      // Set appropriate content type and filename
      let contentType, filename;
      switch (settings.format) {
        case 'google_docs':
        case 'word':
          contentType = 'text/html';
          filename = `${script.title.replace(/\s+/g, '_')}.html`;
          break;
        case 'markdown':
          contentType = 'text/markdown';
          filename = `${script.title.replace(/\s+/g, '_')}.md`;
          break;
        case 'text':
        default:
          contentType = 'text/plain';
          filename = `${script.title.replace(/\s+/g, '_')}.txt`;
          break;
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Error exporting script:", error);
        res.status(500).json({ message: "Failed to export script" });
      }
    }
  });

  // Update script with edits
  app.put('/api/scripts/:id/iterations/:iterationId', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      const iterationId = parseInt(req.params.iterationId);
      
      const contentSchema = z.object({
        content: z.string().min(1),
      });
      
      const { content } = contentSchema.parse(req.body);
      
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      const iteration = await storage.getScriptIteration(iterationId);
      if (!iteration || iteration.scriptId !== scriptId) {
        return res.status(404).json({ message: "Iteration not found" });
      }
      
      const updatedIteration = await storage.updateScriptIteration(iterationId, {
        content,
        status: 'completed',
      });
      
      res.json(updatedIteration);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Error updating iteration:", error);
        res.status(500).json({ message: "Failed to update iteration" });
      }
    }
  });

  // Helper function to start script generation
  async function startScriptGeneration(script: any) {
    // Create an initial "in_progress" iteration
    const newIteration = await storage.createScriptIteration({
      scriptId: script.id,
      iterationNumber: 1,
      content: "Generating script...",
      status: 'in_progress',
      metrics: null,
    });
    
    // Generate the content asynchronously
    generateScriptContent(script, newIteration.id).catch(error => {
      console.error("Error in async script generation:", error);
    });
    
    return newIteration;
  }

  // Helper function to generate next iteration
  async function generateNextIteration(script: any, existingIterations: any[]) {
    const nextIterationNumber = existingIterations.length + 1;
    
    // Create a new "in_progress" iteration
    const newIteration = await storage.createScriptIteration({
      scriptId: script.id,
      iterationNumber: nextIterationNumber,
      content: "Generating next iteration...",
      status: 'in_progress',
      metrics: null,
    });
    
    // Generate the content asynchronously
    generateScriptContent(script, newIteration.id, existingIterations).catch(error => {
      console.error("Error in async script generation:", error);
    });
    
    return newIteration;
  }

  // Helper function to generate script content
  async function generateScriptContent(script: any, iterationId: number, previousIterations: any[] = []) {
    try {
      // Get previous iteration contents
      const prevContents = previousIterations
        .filter(it => it.status === 'completed')
        .map(it => it.content);
      
      // Generate content using the appropriate AI model
      let content: string;
      const options = {
        title: script.title,
        instructions: script.instructions,
        structure: script.structure,
        tone: script.tone,
        length: script.length,
        previousIterations: prevContents,
        reduceRedundancy: script.settings?.reduceRedundancy,
        enhanceClarity: script.settings?.enhanceClarity,
        improveEngagement: script.settings?.improveEngagement,
      };
      
      if (script.aiModel.toLowerCase().includes('claude')) {
        content = await anthropic.generateScript(options);
      } else {
        content = await openai.generateScript(options);
      }
      
      // Calculate metrics
      let metrics: any = {};
      
      if (script.aiModel.toLowerCase().includes('claude')) {
        metrics = await anthropic.analyzeScript(content);
      } else {
        metrics = await openai.analyzeScript(content);
      }
      
      // If this is not the first iteration, calculate redundancy reduction
      if (prevContents.length > 0) {
        const lastContent = prevContents[prevContents.length - 1];
        
        let comparison;
        if (script.aiModel.toLowerCase().includes('claude')) {
          comparison = await anthropic.compareScripts(lastContent, content);
        } else {
          comparison = await openai.compareScripts(lastContent, content);
        }
        
        metrics.redundancyReduction = comparison.redundancyReduction;
        metrics.improvementAreas = comparison.improvementAreas;
      }
      
      // Update the iteration with the generated content and metrics
      await storage.updateScriptIteration(iterationId, {
        content,
        status: 'completed',
        metrics,
      });
    } catch (error) {
      console.error("Error generating script content:", error);
      
      // Update the iteration with the error status
      await storage.updateScriptIteration(iterationId, {
        content: "Error generating script content.",
        status: 'failed',
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
