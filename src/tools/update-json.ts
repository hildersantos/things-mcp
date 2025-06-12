import { jsonBuilder } from '../lib/json-builder.js';
import { UpdateTodoJSONSchema, UpdateProjectJSONSchema, AddItemsToProjectSchema } from '../types/mcp.js';
import { AbstractToolHandler, ToolDefinition } from '../lib/abstract-tool-handler.js';
import { z } from 'zod';

type UpdateJSONParams = any; // Temporary type simplification

/**
 * Unified handler for updating Things 3 items using JSON API
 * Supports updating todos, projects, and adding items to projects
 */
class UpdateJSONToolHandler extends AbstractToolHandler<UpdateJSONParams> {
  protected definitions: ToolDefinition<UpdateJSONParams>[] = [
    {
      name: 'things_update_todo',
      description: 'Update an existing to-do in Things using JSON API for full feature support',
      schema: UpdateTodoJSONSchema as any
    },
    {
      name: 'things_update_project',
      description: 'Update an existing project in Things using JSON API for full feature support',
      schema: UpdateProjectJSONSchema as any
    },
    {
      name: 'things_add_items_to_project',
      description: 'Add todos and headings to an existing project. Items are added as a flat array where headings act as visual separators for the todos that follow them.',
      schema: AddItemsToProjectSchema as any
    }
  ];

  async execute(toolName: string, params: UpdateJSONParams): Promise<string> {
    if (toolName === 'things_update_todo') {
      const todoParams = params as z.infer<typeof UpdateTodoJSONSchema>;
      return jsonBuilder.updateTodo(todoParams);
    } else if (toolName === 'things_update_project') {
      const projectParams = params as z.infer<typeof UpdateProjectJSONSchema>;
      return jsonBuilder.updateProject(projectParams);
    } else if (toolName === 'things_add_items_to_project') {
      const addItemsParams = params as z.infer<typeof AddItemsToProjectSchema>;
      return jsonBuilder.addItemsToProject(addItemsParams);
    }
    
    throw new Error(`Unknown tool: ${toolName}`);
  }
}

export const updateJSONToolHandler = new UpdateJSONToolHandler();

export const updateJSONTools = updateJSONToolHandler.tools;
export const handleUpdateJSON = updateJSONToolHandler.handle.bind(updateJSONToolHandler);