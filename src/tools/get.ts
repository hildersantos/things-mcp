import { executeAppleScriptFile } from '../lib/applescript.js';
import { parseTodoList, parseProjectList, parseAreaList, parseTagList } from '../lib/parser.js';
import { GetProjectSchema, GetAreaSchema, GetListSchema } from '../types/mcp.js';
import { AbstractToolHandler, ToolDefinition } from '../lib/abstract-tool-handler.js';
import { z } from 'zod';

type GetParams = z.infer<typeof GetListSchema> | z.infer<typeof GetProjectSchema> | z.infer<typeof GetAreaSchema>;

class GetToolHandler extends AbstractToolHandler<GetParams> {
  protected definitions: ToolDefinition<GetParams>[] = [
    {
      name: 'things_get_inbox',
      description: 'Get all to-dos in the Inbox',
      schema: GetListSchema
    },
    {
      name: 'things_get_today',
      description: 'Get all to-dos scheduled for Today',
      schema: GetListSchema
    },
    {
      name: 'things_get_upcoming',
      description: 'Get all scheduled to-dos (with dates)',
      schema: GetListSchema
    },
    {
      name: 'things_get_anytime',
      description: 'Get all to-dos in Anytime',
      schema: GetListSchema
    },
    {
      name: 'things_get_someday',
      description: 'Get all to-dos in Someday',
      schema: GetListSchema
    },
    {
      name: 'things_get_projects',
      description: 'Get all active projects',
      schema: GetListSchema
    },
    {
      name: 'things_get_areas',
      description: 'Get all areas',
      schema: GetListSchema
    },
    {
      name: 'things_get_tags',
      description: 'Get all tags',
      schema: GetListSchema
    },
    {
      name: 'things_get_project',
      description: 'Get all to-dos in a specific project',
      schema: GetProjectSchema
    },
    {
      name: 'things_get_area',
      description: 'Get all items in a specific area',
      schema: GetAreaSchema
    }
  ];

  private scriptMap: Record<string, string> = {
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

  async execute(toolName: string, params: GetParams): Promise<string> {
    const scriptName = this.scriptMap[toolName];
    if (!scriptName) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    let scriptArgs: string[] = [];
    const options = { maxResults: params.max_results };
    
    // Handle specific tools that need arguments
    if (toolName === 'things_get_project') {
      const projectParams = params as z.infer<typeof GetProjectSchema>;
      scriptArgs = [projectParams.project_id];
    } else if (toolName === 'things_get_area') {
      const areaParams = params as z.infer<typeof GetAreaSchema>;
      scriptArgs = [areaParams.area_id];
    }
    
    const output = await executeAppleScriptFile(scriptName, scriptArgs, options);
    
    // Return empty array for empty output
    if (!output.trim()) {
      const emptyResult = toolName.includes('project') || toolName.includes('area') 
        ? { todos: [] }
        : { [this.getResultKey(toolName)]: [] };
      return JSON.stringify(emptyResult, null, 2);
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
    
    return JSON.stringify(result, null, 2);
  }

  private getResultKey(toolName: string): string {
    if (toolName.includes('project')) return 'projects';
    if (toolName.includes('area')) return 'areas';
    if (toolName.includes('tag')) return 'tags';
    return 'todos';
  }
}

export const getToolHandler = new GetToolHandler();

export const getTools = getToolHandler.tools;
export const handleGet = getToolHandler.handle.bind(getToolHandler);

