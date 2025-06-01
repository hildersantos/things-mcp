import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeThingsURL } from '../lib/urlscheme.js';
import { SearchSchema } from '../types/mcp.js';
import { ThingsError } from '../lib/errors.js';

export const searchTools: Tool[] = [
  {
    name: 'things_search',
    description: 'Search in Things',
    inputSchema: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          description: 'Search query (leave empty to just open search)' 
        }
      }
    }
  }
];

export async function handleSearch(toolName: string, args: unknown): Promise<unknown> {
  try {
    if (toolName !== 'things_search') {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    const params = SearchSchema.parse(args);
    await executeThingsURL('search', params);
    
    const message = params.query 
      ? `🔍 Search opened with query: "${params.query}"`
      : '🔍 Search opened in Things';
    
    return {
      content: [
        {
          type: "text",
          text: message
        }
      ]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ThingsError(
        'Invalid parameters',
        'VALIDATION_ERROR',
        error.errors
      );
    }
    throw error;
  }
}