import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeThingsURL } from '../lib/urlscheme.js';
import { AddTodoSchema, AddProjectSchema } from '../types/mcp.js';
import { ThingsError } from '../lib/errors.js';

export const addTools: Tool[] = [
  {
    name: 'things_add_todo',
    description: 'Add a new to-do to Things',
    inputSchema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          description: 'Title of the to-do (required)'
        },
        notes: { 
          type: 'string', 
          description: 'Additional notes'
        },
        when: { 
          type: 'string', 
          description: 'When to schedule: today, tomorrow, evening, anytime, someday, or YYYY-MM-DD'
        },
        deadline: { 
          type: 'string', 
          description: 'Deadline date in YYYY-MM-DD format'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to apply'
        },
        checklist_items: {
          type: 'array',
          items: { type: 'string' },
          description: 'Checklist items to add'
        },
        list_id: { 
          type: 'string', 
          description: 'ID of the project to add to'
        },
        list: { 
          type: 'string', 
          description: 'Name of the project to add to'
        },
        heading: { 
          type: 'string', 
          description: 'Heading within the project'
        },
        completed: { 
          type: 'boolean', 
          description: 'Whether the to-do is already completed'
        },
        canceled: { 
          type: 'boolean', 
          description: 'Whether the to-do is canceled'
        }
      },
      required: ['title']
    }
  },
  {
    name: 'things_add_project',
    description: 'Add a new project to Things',
    inputSchema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          description: 'Title of the project (required)'
        },
        notes: { 
          type: 'string', 
          description: 'Project description'
        },
        when: { 
          type: 'string', 
          description: 'When to start: today, tomorrow, evening, anytime, someday, or YYYY-MM-DD'
        },
        deadline: { 
          type: 'string', 
          description: 'Deadline date in YYYY-MM-DD format'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to apply'
        },
        area_id: { 
          type: 'string', 
          description: 'ID of the area to add to'
        },
        area: { 
          type: 'string', 
          description: 'Name of the area to add to'
        },
        todos: {
          type: 'array',
          items: { type: 'string' },
          description: 'Initial to-dos to add to the project'
        },
        completed: { 
          type: 'boolean', 
          description: 'Whether the project is already completed'
        },
        canceled: { 
          type: 'boolean', 
          description: 'Whether the project is canceled'
        }
      },
      required: ['title']
    }
  }
];

export async function handleAdd(toolName: string, args: unknown): Promise<unknown> {
  try {
    if (toolName === 'things_add_todo') {
      const params = AddTodoSchema.parse(args);
      await executeThingsURL('add', params);
      return {
        content: [
          {
            type: "text",
            text: `✅ To-do created successfully: "${params.title}"`
          }
        ]
      };
    } else if (toolName === 'things_add_project') {
      const params = AddProjectSchema.parse(args);
      await executeThingsURL('add-project', params);
      return {
        content: [
          {
            type: "text",
            text: `✅ Project created successfully: "${params.title}"`
          }
        ]
      };
    }
    
    throw new Error(`Unknown tool: ${toolName}`);
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