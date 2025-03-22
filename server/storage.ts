import {
  users,
  scripts,
  scriptIterations,
  type User,
  type InsertUser,
  type Script,
  type InsertScript,
  type ScriptIteration,
  type InsertScriptIteration,
  type ScriptSettings,
  type ScriptMetrics
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Script operations
  getScript(id: number): Promise<Script | undefined>;
  getUserScripts(userId: number): Promise<Script[]>;
  createScript(script: InsertScript): Promise<Script>;
  updateScript(id: number, script: Partial<Script>): Promise<Script | undefined>;
  deleteScript(id: number): Promise<boolean>;
  
  // Script iteration operations
  getScriptIterations(scriptId: number): Promise<ScriptIteration[]>;
  getScriptIteration(id: number): Promise<ScriptIteration | undefined>;
  createScriptIteration(iteration: InsertScriptIteration): Promise<ScriptIteration>;
  updateScriptIteration(id: number, iteration: Partial<ScriptIteration>): Promise<ScriptIteration | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scripts: Map<number, Script>;
  private scriptIterations: Map<number, ScriptIteration>;
  private userId: number;
  private scriptId: number;
  private iterationId: number;

  constructor() {
    this.users = new Map();
    this.scripts = new Map();
    this.scriptIterations = new Map();
    this.userId = 1;
    this.scriptId = 1;
    this.iterationId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Script operations
  async getScript(id: number): Promise<Script | undefined> {
    return this.scripts.get(id);
  }

  async getUserScripts(userId: number): Promise<Script[]> {
    return Array.from(this.scripts.values()).filter(
      (script) => script.userId === userId
    );
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const id = this.scriptId++;
    const script: Script = {
      ...insertScript,
      id,
      createdAt: new Date()
    };
    this.scripts.set(id, script);
    return script;
  }

  async updateScript(id: number, scriptUpdate: Partial<Script>): Promise<Script | undefined> {
    const script = this.scripts.get(id);
    if (!script) return undefined;
    
    const updatedScript = { ...script, ...scriptUpdate };
    this.scripts.set(id, updatedScript);
    return updatedScript;
  }

  async deleteScript(id: number): Promise<boolean> {
    // Delete all iterations first
    const iterations = await this.getScriptIterations(id);
    for (const iteration of iterations) {
      this.scriptIterations.delete(iteration.id);
    }
    
    return this.scripts.delete(id);
  }

  // Script iteration operations
  async getScriptIterations(scriptId: number): Promise<ScriptIteration[]> {
    return Array.from(this.scriptIterations.values()).filter(
      (iteration) => iteration.scriptId === scriptId
    ).sort((a, b) => a.iterationNumber - b.iterationNumber);
  }

  async getScriptIteration(id: number): Promise<ScriptIteration | undefined> {
    return this.scriptIterations.get(id);
  }

  async createScriptIteration(insertIteration: InsertScriptIteration): Promise<ScriptIteration> {
    const id = this.iterationId++;
    const iteration: ScriptIteration = {
      ...insertIteration,
      id,
      createdAt: new Date()
    };
    this.scriptIterations.set(id, iteration);
    return iteration;
  }

  async updateScriptIteration(id: number, iterationUpdate: Partial<ScriptIteration>): Promise<ScriptIteration | undefined> {
    const iteration = this.scriptIterations.get(id);
    if (!iteration) return undefined;
    
    const updatedIteration = { ...iteration, ...iterationUpdate };
    this.scriptIterations.set(id, updatedIteration);
    return updatedIteration;
  }
}

export const storage = new MemStorage();
