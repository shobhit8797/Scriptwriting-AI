import { 
  scripts, 
  iterations, 
  type Script, 
  type InsertScript, 
  type Iteration, 
  type InsertIteration 
} from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // Script operations
  getScript(id: number): Promise<Script | undefined>;
  getAllScripts(): Promise<Script[]>;
  createScript(script: InsertScript): Promise<Script>;
  updateScript(id: number, updates: Partial<Script>): Promise<Script | undefined>;
  deleteScript(id: number): Promise<boolean>;
  
  // Iteration operations
  getIteration(id: number): Promise<Iteration | undefined>;
  getIterationsByScriptId(scriptId: number): Promise<Iteration[]>;
  createIteration(iteration: InsertIteration): Promise<Iteration>;
  updateIteration(id: number, updates: Partial<Iteration>): Promise<Iteration | undefined>;
  deleteIteration(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private scripts: Map<number, Script>;
  private iterations: Map<number, Iteration>;
  private scriptCurrentId: number;
  private iterationCurrentId: number;

  constructor() {
    this.scripts = new Map();
    this.iterations = new Map();
    this.scriptCurrentId = 1;
    this.iterationCurrentId = 1;
  }

  // Script operations
  async getScript(id: number): Promise<Script | undefined> {
    return this.scripts.get(id);
  }

  async getAllScripts(): Promise<Script[]> {
    return Array.from(this.scripts.values());
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const id = this.scriptCurrentId++;
    const script: Script = { 
      ...insertScript, 
      id, 
      currentIteration: 0,
      totalIterations: 4,
      status: "draft"
    };
    this.scripts.set(id, script);
    return script;
  }

  async updateScript(id: number, updates: Partial<Script>): Promise<Script | undefined> {
    const script = this.scripts.get(id);
    if (!script) return undefined;
    
    const updatedScript = { ...script, ...updates };
    this.scripts.set(id, updatedScript);
    return updatedScript;
  }

  async deleteScript(id: number): Promise<boolean> {
    return this.scripts.delete(id);
  }

  // Iteration operations
  async getIteration(id: number): Promise<Iteration | undefined> {
    return this.iterations.get(id);
  }

  async getIterationsByScriptId(scriptId: number): Promise<Iteration[]> {
    return Array.from(this.iterations.values())
      .filter(iteration => iteration.scriptId === scriptId)
      .sort((a, b) => a.iterationNumber - b.iterationNumber);
  }

  async createIteration(insertIteration: InsertIteration): Promise<Iteration> {
    const id = this.iterationCurrentId++;
    const iteration: Iteration = { ...insertIteration, id };
    this.iterations.set(id, iteration);
    
    // Update script's current iteration if needed
    const script = await this.getScript(insertIteration.scriptId);
    if (script && insertIteration.iterationNumber > script.currentIteration) {
      await this.updateScript(script.id, { 
        currentIteration: insertIteration.iterationNumber,
        status: insertIteration.iterationNumber >= script.totalIterations ? "completed" : "in_progress"
      });
    }
    
    return iteration;
  }

  async updateIteration(id: number, updates: Partial<Iteration>): Promise<Iteration | undefined> {
    const iteration = this.iterations.get(id);
    if (!iteration) return undefined;
    
    const updatedIteration = { ...iteration, ...updates };
    this.iterations.set(id, updatedIteration);
    return updatedIteration;
  }

  async deleteIteration(id: number): Promise<boolean> {
    return this.iterations.delete(id);
  }
}

// Export the storage instance
export const storage = new MemStorage();
