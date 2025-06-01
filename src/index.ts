#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { addTools, handleAdd } from './tools/add.js';
import { getTools, handleGet } from './tools/get.js';
import { showTools, handleShow } from './tools/show.js';
import { searchTools, handleSearch } from './tools/search.js';
import { testThingsAvailable } from './lib/applescript.js';
import { ThingsError } from './lib/errors.js';

// Combine all tools
const allTools = [
  ...addTools,
  ...getTools,
  ...showTools,
  ...searchTools
];

// Create tool handler map for efficient routing
const toolHandlers = new Map<string, (args: any) => Promise<any>>();

// Register add handlers
addTools.forEach(tool => {
  toolHandlers.set(tool.name, (args) => handleAdd(tool.name, args));
});

// Register get handlers
getTools.forEach(tool => {
  toolHandlers.set(tool.name, (args) => handleGet(tool.name, args));
});

// Register show handlers
showTools.forEach(tool => {
  toolHandlers.set(tool.name, (args) => handleShow(tool.name, args));
});

// Register search handlers
searchTools.forEach(tool => {
  toolHandlers.set(tool.name, (args) => handleSearch(tool.name, args));
});

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
    tools: allTools,
  };
});

// Handler for executing tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    const handler = toolHandlers.get(name);
    if (!handler) {
      throw new ThingsError(
        `Unknown tool: ${name}`,
        'UNKNOWN_TOOL'
      );
    }
    
    return await handler(args || {});
  } catch (error) {
    // Transform errors to a consistent format
    if (error instanceof ThingsError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ThingsError(
        error.message,
        'EXECUTION_ERROR',
        { originalError: error.toString() }
      );
    }
    
    throw new ThingsError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      { error: String(error) }
    );
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