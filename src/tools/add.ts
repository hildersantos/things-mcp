import { executeThingsURL } from '../lib/urlscheme.js';
import { AddTodoSchema, AddProjectSchema } from '../types/mcp.js';
import { AbstractToolHandler, ToolDefinition } from '../lib/abstract-tool-handler.js';
import { z } from 'zod';

type AddParams = z.infer<typeof AddTodoSchema> | z.infer<typeof AddProjectSchema>;

class AddToolHandler extends AbstractToolHandler<AddParams> {
  protected definitions: ToolDefinition<AddParams>[] = [
    {
      name: 'things_add_todo',
      description: 'Add a new to-do to Things',
      schema: AddTodoSchema
    },
    {
      name: 'things_add_project',
      description: 'Add a new project to Things',
      schema: AddProjectSchema
    }
  ];

  async execute(toolName: string, params: AddParams): Promise<string> {
    if (toolName === 'things_add_todo') {
      const todoParams = params as z.infer<typeof AddTodoSchema>;
      await executeThingsURL('add', todoParams);
      return `✅ To-do created successfully: "${todoParams.title}"`;
    } else if (toolName === 'things_add_project') {
      const projectParams = params as z.infer<typeof AddProjectSchema>;
      await executeThingsURL('add-project', projectParams);
      return `✅ Project created successfully: "${projectParams.title}"`;
    }
    
    throw new Error(`Unknown tool: ${toolName}`);
  }
}

export const addToolHandler = new AddToolHandler();

export const addTools = addToolHandler.tools;
export const handleAdd = addToolHandler.handle.bind(addToolHandler);