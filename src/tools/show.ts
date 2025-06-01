import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeThingsURL } from '../lib/urlscheme.js';
import { ShowSchema } from '../types/mcp.js';
import { ThingsError } from '../lib/errors.js';

export const showTools: Tool[] = [
  {
    name: 'things_show',
    description: 'Navigate to a specific item or list in Things',
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'ID of a specific to-do, project, or area' 
        },
        query: { 
          type: 'string', 
          description: 'Navigate to a list: inbox, today, anytime, upcoming, someday, logbook, trash' 
        },
        filter: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags when showing a list'
        }
      }
    }
  }
];

export async function handleShow(toolName: string, args: unknown): Promise<unknown> {
  try {
    if (toolName !== 'things_show') {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    const params = ShowSchema.parse(args);
    await executeThingsURL('show', params);
    
    const message = params.id 
      ? '🔍 Navigated to item in Things'
      : `🔍 Navigated to: ${params.query}`;
    
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