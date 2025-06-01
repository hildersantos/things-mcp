import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ThingsError } from './errors.js';
import { zodToJsonSchema } from './schema-utils.js';

export type ToolResponse = CallToolResult;

export interface ToolDefinition<TParams = unknown> {
  name: string;
  description: string;
  schema: z.ZodSchema<TParams>;
}

export abstract class AbstractToolHandler<TParams = unknown> {
  protected abstract definitions: ToolDefinition<TParams>[];

  abstract execute(toolName: string, params: TParams): Promise<string>;

  get tools(): Tool[] {
    return this.definitions.map(def => {
      const schema = zodToJsonSchema(def.schema);
      return {
        name: def.name,
        description: def.description,
        inputSchema: {
          type: 'object' as const,
          properties: schema.properties || {},
          ...(schema.required && { required: schema.required })
        }
      };
    });
  }

  async handle(toolName: string, args: unknown): Promise<ToolResponse> {
    try {
      const definition = this.definitions.find(def => def.name === toolName);
      if (!definition) {
        return this.handleError(new Error(`Unknown tool: ${toolName}`));
      }

      const params = definition.schema.parse(args);
      const result = await this.execute(toolName, params);
      
      return this.formatResponse(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected formatResponse(message: string): ToolResponse {
    return {
      content: [
        {
          type: "text",
          text: message
        }
      ]
    };
  }

  protected handleError(error: unknown): ToolResponse {
    let errorMessage: string;
    
    if (error instanceof z.ZodError) {
      errorMessage = `Invalid parameters: ${error.errors.map(e => e.message).join(', ')}`;
    } else if (error instanceof ThingsError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: errorMessage
        }
      ]
    };
  }

}