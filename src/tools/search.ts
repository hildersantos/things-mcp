import { executeThingsURL } from '../lib/urlscheme.js';
import { SearchSchema } from '../types/mcp.js';
import { AbstractToolHandler, ToolDefinition } from '../lib/abstract-tool-handler.js';
import { z } from 'zod';

type SearchParams = z.infer<typeof SearchSchema>;

class SearchToolHandler extends AbstractToolHandler<SearchParams> {
  protected definitions: ToolDefinition<SearchParams>[] = [
    {
      name: 'things_search',
      description: 'Search in Things',
      schema: SearchSchema
    }
  ];

  async execute(toolName: string, params: SearchParams): Promise<string> {
    if (toolName !== 'things_search') {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    await executeThingsURL('search', params);
    
    return params.query 
      ? `🔍 Search opened with query: "${params.query}"`
      : '🔍 Search opened in Things';
  }
}

export const searchToolHandler = new SearchToolHandler();

export const searchTools = searchToolHandler.tools;
export const handleSearch = searchToolHandler.handle.bind(searchToolHandler);