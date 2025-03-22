import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { getAIService } from "./lib/ai-service";
import { insertScriptSchema, insertIterationSchema, scriptStructureSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all with /api
  
  // Get all scripts
  app.get('/api/scripts', async (req: Request, res: Response) => {
    try {
      const scripts = await storage.getAllScripts();
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scripts" });
    }
  });

  // Get a script by ID
  app.get('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid script ID" });
      }
      
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      res.json(script);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch script" });
    }
  });

  // Create a new script
  app.post('/api/scripts', async (req: Request, res: Response) => {
    try {
      const validationResult = insertScriptSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid script data", 
          errors: validationResult.error.format() 
        });
      }
      
      // Validate script structure
      const structureResult = scriptStructureSchema.safeParse(req.body.structure);
      if (!structureResult.success) {
        return res.status(400).json({ 
          message: "Invalid script structure", 
          errors: structureResult.error.format() 
        });
      }
      
      const createdAt = new Date().toISOString();
      const script = await storage.createScript({ ...req.body, createdAt });
      res.status(201).json(script);
    } catch (error) {
      res.status(500).json({ message: "Failed to create script" });
    }
  });

  // Update a script
  app.patch('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid script ID" });
      }
      
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      const updatedScript = await storage.updateScript(id, req.body);
      res.json(updatedScript);
    } catch (error) {
      res.status(500).json({ message: "Failed to update script" });
    }
  });

  // Delete a script
  app.delete('/api/scripts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid script ID" });
      }
      
      const success = await storage.deleteScript(id);
      if (!success) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete script" });
    }
  });

  // Get all iterations for a script
  app.get('/api/scripts/:id/iterations', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      if (isNaN(scriptId)) {
        return res.status(400).json({ message: "Invalid script ID" });
      }
      
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      const iterations = await storage.getIterationsByScriptId(scriptId);
      res.json(iterations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch iterations" });
    }
  });

  // Generate initial script
  app.post('/api/scripts/:id/generate', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      if (isNaN(scriptId)) {
        return res.status(400).json({ message: "Invalid script ID" });
      }
      
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      // Update script status
      await storage.updateScript(scriptId, { 
        status: "in_progress",
        currentIteration: 0
      });
      
      // Get AI service based on the script's model
      const aiService = getAIService(script.model as any);
      
      // Generate the initial script
      const content = await aiService.generateScript({
        title: script.title,
        description: script.description,
        length: script.length,
        tone: script.tone,
        style: script.style,
        structure: script.structure as any,
        modelName: script.model as any,
        iterationNumber: 1
      });
      
      // Create the first iteration
      const createdAt = new Date().toISOString();
      const iteration = await storage.createIteration({
        scriptId,
        iterationNumber: 1,
        content,
        status: "completed",
        improvements: "Initial script generation",
        createdAt
      });
      
      // Update script's current iteration
      await storage.updateScript(scriptId, { 
        currentIteration: 1,
        status: "in_progress" 
      });
      
      res.json({ 
        success: true, 
        iteration,
        message: "Initial script generated successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to generate script", 
        error: error.message 
      });
    }
  });

  // Improve script (next iteration)
  app.post('/api/scripts/:id/improve', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      if (isNaN(scriptId)) {
        return res.status(400).json({ message: "Invalid script ID" });
      }
      
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      // Get all existing iterations
      const iterations = await storage.getIterationsByScriptId(scriptId);
      
      // Determine the next iteration number
      const nextIterationNumber = (iterations.length > 0) 
        ? Math.max(...iterations.map(i => i.iterationNumber)) + 1 
        : 1;
      
      if (nextIterationNumber > script.totalIterations) {
        return res.status(400).json({ 
          message: "Maximum number of iterations reached" 
        });
      }
      
      // Get the latest iteration content
      const latestIteration = iterations
        .sort((a, b) => b.iterationNumber - a.iterationNumber)[0];
      
      if (!latestIteration) {
        return res.status(400).json({ 
          message: "No previous iteration found. Generate initial script first." 
        });
      }
      
      // Get AI service based on the script's model
      const aiService = getAIService(script.model as any);
      
      // Improve the script
      const { content, improvements } = await aiService.improveScript({
        title: script.title,
        description: script.description,
        length: script.length,
        tone: script.tone,
        style: script.style,
        structure: script.structure as any,
        modelName: script.model as any,
        iterationNumber: nextIterationNumber,
        previousContent: latestIteration.content
      });
      
      // Create the next iteration
      const createdAt = new Date().toISOString();
      const iteration = await storage.createIteration({
        scriptId,
        iterationNumber: nextIterationNumber,
        content,
        status: "completed",
        improvements,
        createdAt
      });
      
      // Check if this is the final iteration
      const isComplete = nextIterationNumber >= script.totalIterations;
      
      // Update script's current iteration and status
      await storage.updateScript(scriptId, { 
        currentIteration: nextIterationNumber,
        status: isComplete ? "completed" : "in_progress" 
      });
      
      res.json({ 
        success: true, 
        iteration,
        isComplete,
        message: `Script improved successfully (iteration ${nextIterationNumber})` 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to improve script", 
        error: error.message 
      });
    }
  });

  // Update iteration content (after manual editing)
  app.patch('/api/iterations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid iteration ID" });
      }
      
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const iteration = await storage.getIteration(id);
      if (!iteration) {
        return res.status(404).json({ message: "Iteration not found" });
      }
      
      const updatedIteration = await storage.updateIteration(id, { content });
      res.json(updatedIteration);
    } catch (error) {
      res.status(500).json({ message: "Failed to update iteration" });
    }
  });

  // Export script (simulate document generation)
  app.post('/api/scripts/:id/export', async (req: Request, res: Response) => {
    try {
      const scriptId = parseInt(req.params.id);
      if (isNaN(scriptId)) {
        return res.status(400).json({ message: "Invalid script ID" });
      }
      
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      const { format, options } = req.body;
      if (!format) {
        return res.status(400).json({ message: "Export format is required" });
      }
      
      // Get the latest iteration
      const iterations = await storage.getIterationsByScriptId(scriptId);
      const latestIteration = iterations
        .sort((a, b) => b.iterationNumber - a.iterationNumber)[0];
      
      if (!latestIteration) {
        return res.status(400).json({ message: "No script content to export" });
      }
      
      // In a real application, this would generate and return the document
      // For now, we'll just return success and the formatting options
      res.json({
        success: true,
        message: `Script exported as ${format}`,
        format,
        options,
        script: {
          title: script.title,
          content: latestIteration.content
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export script" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
