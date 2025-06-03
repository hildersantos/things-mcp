#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Things MCP Server

A Model Context Protocol server for Things 3 integration.

Usage:
  npx github:hildersantos/things-mcp      Start the MCP server
  npx github:hildersantos/things-mcp -h   Show this help

Requirements:
  - macOS with Things 3 installed
  - Node.js 18 or later

The server will start and listen for MCP connections.
Use Ctrl+C to stop the server.
`);
  process.exit(0);
}

// Path to the main server file
const serverPath = join(__dirname, '..', 'dist', 'index.js');

// Check if built files exist
if (!existsSync(serverPath)) {
  console.error('[ERROR] Server files not found. Setting up project...');
  
  // Check if node_modules exists
  const nodeModulesPath = join(__dirname, '..', 'node_modules');
  if (!existsSync(nodeModulesPath)) {
    console.log('[INFO] Installing dependencies...');
    
    const installProcess = spawn('npm', ['install', '--production'], {
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    });
    
    installProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('[OK] Dependencies installed. Building project...');
        buildProject();
      } else {
        console.error('[ERROR] Installation failed');
        process.exit(1);
      }
    });
  } else {
    buildProject();
  }
} else {
  // Start the server if files exist
  startServer();
}

function buildProject() {
  console.log('[INFO] Running npm run build...');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  
  buildProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('[OK] Build completed. Starting server...');
      startServer();
    } else {
      console.error('[ERROR] Build failed');
      process.exit(1);
    }
  });
}

function startServer() {
  console.log('[INFO] Starting Things MCP Server...');
  console.log('[INFO] Server path:', serverPath);

  // Start the MCP server
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure Node.js experimental modules are enabled
      NODE_OPTIONS: process.env.NODE_OPTIONS || ''
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n[INFO] Shutting down Things MCP Server...');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[INFO] Shutting down Things MCP Server...');
    server.kill('SIGTERM');
    process.exit(0);
  });

  // Handle server exit
  server.on('exit', (code, signal) => {
    if (code !== null) {
      console.log(`\n[ERROR] Things MCP Server exited with code ${code}`);
      process.exit(code);
    } else if (signal) {
      console.log(`\n[ERROR] Things MCP Server killed by signal ${signal}`);
      process.exit(1);
    }
  });

  server.on('error', (error) => {
    console.error('[ERROR] Failed to start Things MCP Server:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('\n[INFO] Make sure to build the project first:');
      console.error('   npm run build');
    }
    
    process.exit(1);
  });
}