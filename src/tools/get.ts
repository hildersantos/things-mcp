import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeAppleScriptFile } from '../lib/applescript.js';
import { parseTodoList, parseProjectList, parseAreaList, parseTagList } from '../lib/parser.js';
import { GetProjectSchema, GetAreaSchema } from '../types/mcp.js';
import { ThingsError } from '../lib/errors.js';

export const getTools: Tool[] = [
  {
    name: 'things_get_inbox',
    description: 'Get all to-dos in the Inbox',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { 
          type: 'number', 
          description: 'Maximum number of results to return' 
        }
      } 
    }
  },
  {
    name: 'things_get_today',
    description: 'Get all to-dos scheduled for Today',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_upcoming',
    description: 'Get all scheduled to-dos (with dates)',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_anytime',
    description: 'Get all to-dos in Anytime',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_someday',
    description: 'Get all to-dos in Someday',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_projects',
    description: 'Get all active projects',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_areas',
    description: 'Get all areas',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'things_get_tags',
    description: 'Get all tags',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'things_get_project',
    description: 'Get all to-dos in a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { 
          type: 'string', 
          description: 'ID of the project (get from things_get_projects)' 
        },
        max_results: { type: 'number' }
      },
      required: ['project_id']
    }
  },
  {
    name: 'things_get_area',
    description: 'Get all items in a specific area',
    inputSchema: {
      type: 'object',
      properties: {
        area_id: { 
          type: 'string', 
          description: 'ID of the area (get from things_get_areas)' 
        },
        max_results: { type: 'number' }
      },
      required: ['area_id']
    }
  }
];

const scriptMap: Record<string, string> = {
  'things_get_inbox': 'get-inbox',
  'things_get_today': 'get-today',
  'things_get_upcoming': 'get-upcoming',
  'things_get_anytime': 'get-anytime',
  'things_get_someday': 'get-someday',
  'things_get_projects': 'get-projects',
  'things_get_areas': 'get-areas',
  'things_get_tags': 'get-tags',
  'things_get_project': 'get-project-todos',
  'things_get_area': 'get-area-items'
};

export async function handleGet(toolName: string, args: unknown): Promise<unknown> {
  try {
    const scriptName = scriptMap[toolName];
    if (!scriptName) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    let scriptArgs: string[] = [];
    const options = { maxResults: (args as { max_results?: number }).max_results };
    
    // Handle specific tools that need arguments
    if (toolName === 'things_get_project') {
      const params = GetProjectSchema.parse(args);
      scriptArgs = [params.project_id];
    } else if (toolName === 'things_get_area') {
      const params = GetAreaSchema.parse(args);
      scriptArgs = [params.area_id];
    }
    
    const output = await executeAppleScriptFile(scriptName, scriptArgs, options);
    
    // Return empty array for empty output
    if (!output.trim()) {
      const emptyResult = toolName.includes('project') || toolName.includes('area') 
        ? { todos: [] }
        : { [getResultKey(toolName)]: [] };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(emptyResult, null, 2)
          }
        ]
      };
    }
    
    // Parse based on tool type
    let result;
    switch (toolName) {
      case 'things_get_projects':
        result = { projects: parseProjectList(output) };
        break;
      case 'things_get_areas':
        result = { areas: parseAreaList(output) };
        break;
      case 'things_get_tags':
        result = { tags: parseTagList(output) };
        break;
      default:
        result = { todos: parseTodoList(output) };
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
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

function getResultKey(toolName: string): string {
  if (toolName.includes('project')) return 'projects';
  if (toolName.includes('area')) return 'areas';
  if (toolName.includes('tag')) return 'tags';
  return 'todos';
}