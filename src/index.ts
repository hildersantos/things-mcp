#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { addToolHandler } from './tools/add.js';
import { getToolHandler } from './tools/get.js';
import { showToolHandler } from './tools/show.js';
import { searchToolHandler } from './tools/search.js';
import { testThingsAvailable } from './lib/applescript.js';
import { toolRegistry } from './lib/tool-registry.js';

// Register all tool handlers
toolRegistry.registerToolHandler(addToolHandler);
toolRegistry.registerToolHandler(getToolHandler);
toolRegistry.registerToolHandler(showToolHandler);
toolRegistry.registerToolHandler(searchToolHandler);

// Create MCP server
const server = new Server(
  {
    name: 'things-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolRegistry.getAllTools(),
  };
});

// Handler for executing tools
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;
  
  try {
    return await toolRegistry.executeHandler(name, args || {});
  } catch (error) {
    // Fallback error handling for unexpected registry errors
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      ]
    };
  }
});

// Initialize server
async function main() {
  try {
    // Check if Things is available
    const thingsAvailable = await testThingsAvailable();
    if (!thingsAvailable) {
      console.error('Warning: Things 3 does not appear to be running');
    }
    
    // Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('Things MCP server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.error('Server shutting down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Server shutting down');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});