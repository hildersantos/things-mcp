import { executeThingsURL } from '../lib/urlscheme.js';
import { UpdateTodoSchema, UpdateProjectSchema } from '../types/mcp.js';
import { AbstractToolHandler, ToolDefinition } from '../lib/abstract-tool-handler.js';
import { z } from 'zod';

type UpdateParams = z.infer<typeof UpdateTodoSchema> | z.infer<typeof UpdateProjectSchema>;

class UpdateToolHandler extends AbstractToolHandler<UpdateParams> {
  protected definitions: ToolDefinition<UpdateParams>[] = [
    {
      name: 'things_update_todo',
      description: 'Update an existing to-do in Things 3',
      schema: UpdateTodoSchema
    },
    {
      name: 'things_update_project',
      description: 'Update an existing project in Things 3',
      schema: UpdateProjectSchema
    }
  ];

  async execute(toolName: string, params: UpdateParams): Promise<string> {
    if (toolName === 'things_update_todo') {
      const todoParams = params as z.infer<typeof UpdateTodoSchema>;
      await executeThingsURL('update', todoParams);
      return `✅ To-do updated successfully: ${todoParams.title || 'ID ' + todoParams.id}`;
    } else if (toolName === 'things_update_project') {
      const projectParams = params as z.infer<typeof UpdateProjectSchema>;
      await executeThingsURL('update-project', projectParams);
      return `✅ Project updated successfully: ${projectParams.title || 'ID ' + projectParams.id}`;
    }
    
    throw new Error(`Unknown tool: ${toolName}`);
  }
}

export const updateToolHandler = new UpdateToolHandler();

export const updateTools = updateToolHandler.tools;
export const handleUpdate = updateToolHandler.handle.bind(updateToolHandler);