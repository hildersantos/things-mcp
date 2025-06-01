import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AbstractToolHandler, ToolResponse } from './abstract-tool-handler.js';

export interface ToolHandler {
  handle(toolName: string, args: unknown): Promise<ToolResponse>;
  tools: Tool[];
}

export class ToolRegistry {
  private handlers = new Map<string, ToolHandler>();
  private toolToHandler = new Map<string, string>();

  registerHandler(handlerName: string, handler: ToolHandler): void {
    this.handlers.set(handlerName, handler);
    
    // Map each tool to its handler
    for (const tool of handler.tools) {
      this.toolToHandler.set(tool.name, handlerName);
    }
  }

  registerToolHandler(handler: AbstractToolHandler): void {
    const handlerName = handler.constructor.name;
    this.registerHandler(handlerName, handler);
  }

  getHandler(toolName: string): ToolHandler | undefined {
    const handlerName = this.toolToHandler.get(toolName);
    if (!handlerName) {
      return undefined;
    }
    return this.handlers.get(handlerName);
  }

  getAllTools(): Tool[] {
    const tools: Tool[] = [];
    for (const handler of this.handlers.values()) {
      tools.push(...handler.tools);
    }
    return tools;
  }

  async executeHandler(toolName: string, args: unknown): Promise<ToolResponse> {
    const handler = this.getHandler(toolName);
    if (!handler) {
      throw new Error(`No handler found for tool: ${toolName}`);
    }
    return handler.handle(toolName, args);
  }

  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  hasHandler(handlerName: string): boolean {
    return this.handlers.has(handlerName);
  }

  hasTool(toolName: string): boolean {
    return this.toolToHandler.has(toolName);
  }

  clear(): void {
    this.handlers.clear();
    this.toolToHandler.clear();
  }
}

// Singleton instance for global use
export const toolRegistry = new ToolRegistry();