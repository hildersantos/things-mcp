import { executeThingsURL } from '../lib/urlscheme.js';
import { ShowSchema } from '../types/mcp.js';
import { AbstractToolHandler, ToolDefinition } from '../lib/abstract-tool-handler.js';
import { z } from 'zod';

type ShowParams = z.infer<typeof ShowSchema>;

class ShowToolHandler extends AbstractToolHandler<ShowParams> {
  protected definitions: ToolDefinition<ShowParams>[] = [
    {
      name: 'things_show',
      description: 'Navigate to a specific item or list in Things',
      schema: ShowSchema
    }
  ];

  async execute(toolName: string, params: ShowParams): Promise<string> {
    if (toolName !== 'things_show') {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    await executeThingsURL('show', params);
    
    return params.id 
      ? '🔍 Navigated to item in Things'
      : `🔍 Navigated to: ${params.query}`;
  }
}

export const showToolHandler = new ShowToolHandler();

export const showTools = showToolHandler.tools;
export const handleShow = showToolHandler.handle.bind(showToolHandler);