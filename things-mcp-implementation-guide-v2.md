# Things MCP Implementation Guide (Enhanced)

## Overview

This guide details the implementation of a secure and robust Model Context Protocol (MCP) server for Things 3 integration. The MCP enables Claude Desktop and Claude Code to interact with Things for creating tasks, projects, and retrieving information.

## Architecture

### Technologies
- **TypeScript** - For type safety and better developer experience
- **MCP SDK** - Framework for building MCP servers
- **Things URL Scheme** - For write operations
- **AppleScript** - For read operations
- **Node.js child_process** - For executing commands securely

### Design Principles
- Mirror Things URL Scheme nomenclature for consistency
- Clear separation between write operations (URL) and read operations (AppleScript)
- AppleScript files stored separately for maintainability and security
- Minimalist responses with sufficient context
- Security-first approach with input validation and sanitization

## Project Structure

```
things-mcp/
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── things.ts
│   │   └── mcp.ts
│   ├── tools/
│   │   ├── add.ts
│   │   ├── update.ts
│   │   ├── show.ts
│   │   ├── search.ts
│   │   └── get.ts
│   ├── lib/
│   │   ├── urlscheme.ts
│   │   ├── applescript.ts
│   │   ├── parser.ts
│   │   ├── auth.ts
│   │   ├── errors.ts
│   │   └── validation.ts
│   └── scripts/
│       ├── get-inbox.applescript
│       ├── get-today.applescript
│       ├── get-upcoming.applescript
│       ├── get-anytime.applescript
│       ├── get-someday.applescript
│       ├── get-projects.applescript
│       ├── get-areas.applescript
│       ├── get-tags.applescript
│       ├── get-project-todos.applescript
│       └── get-area-items.applescript
├── dist/
└── tests/
    ├── unit/
    └── integration/
```

## Step 1: Initial Setup

### 1.1 Create package.json

```json
{
  "name": "things-mcp",
  "version": "1.0.0",
  "description": "Secure MCP server for Things 3 integration",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 1.2 Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 1.3 Create .gitignore

```
node_modules/
dist/
.DS_Store
*.log
.env
.env.local
coverage/
.vscode/
.idea/
```

### 1.4 Create .eslintrc.json

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

## Step 2: Define Types

### 2.1 src/types/things.ts

```typescript
/**
 * Core Things 3 types based on URL Scheme and AppleScript documentation
 */

export interface ThingsTodo {
  id: string;
  name: string;
  area?: string;
  tags: string[];
}

export interface ThingsProject {
  id: string;
  name: string;
  area?: string;
  tags: string[];
}

export interface ThingsArea {
  id: string;
  name: string;
}

export interface ThingsTag {
  id: string;
  name: string;
  parent?: string;
}

// Valid values for 'when' parameter
export type WhenLiteral = 'today' | 'tomorrow' | 'evening' | 'anytime' | 'someday';
export type DateString = string; // YYYY-MM-DD format
export type DateTimeString = string; // YYYY-MM-DD@HH:MM format

// Parameters for creating to-do
export interface AddTodoParams {
  title: string;
  notes?: string;
  when?: WhenLiteral | DateString | DateTimeString;
  deadline?: DateString;
  tags?: string[];
  checklist_items?: string[];
  list_id?: string;
  list?: string;
  heading?: string;
  completed?: boolean;
  canceled?: boolean;
}

// Parameters for creating project
export interface AddProjectParams {
  title: string;
  notes?: string;
  when?: WhenLiteral | DateString | DateTimeString;
  deadline?: DateString;
  tags?: string[];
  area_id?: string;
  area?: string;
  todos?: string[];
  completed?: boolean;
  canceled?: boolean;
}

// Parameters for show command
export interface ShowParams {
  id?: string;
  query?: string;
  filter?: string[];
}

// Parameters for search command
export interface SearchParams {
  query?: string;
}

// Available lists in Things
export type ThingsList = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook' | 'trash';
```

### 2.2 src/types/mcp.ts

```typescript
import { z } from 'zod';

/**
 * Zod schemas for MCP parameter validation
 */

// Custom validators
const WhenEnum = z.enum(['today', 'tomorrow', 'evening', 'anytime', 'someday']);
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD');
const DateTimeString = z.string().regex(/^\d{4}-\d{2}-\d{2}@\d{2}:\d{2}$/, 'Invalid datetime format. Use YYYY-MM-DD@HH:MM');

export const AddTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  notes: z.string().max(10000, 'Notes too long').optional(),
  when: z.union([WhenEnum, DateString, DateTimeString]).optional(),
  deadline: DateString.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  checklist_items: z.array(z.string().max(255)).max(100, 'Too many checklist items').optional(),
  list_id: z.string().optional(),
  list: z.string().max(255).optional(),
  heading: z.string().max(255).optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional()
});

export const AddProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  notes: z.string().max(10000, 'Notes too long').optional(),
  when: z.union([WhenEnum, DateString, DateTimeString]).optional(),
  deadline: DateString.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  area_id: z.string().optional(),
  area: z.string().max(255).optional(),
  todos: z.array(z.string().max(255)).max(100, 'Too many todos').optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional()
});

export const ShowSchema = z.object({
  id: z.string().optional(),
  query: z.string().max(255).optional(),
  filter: z.array(z.string()).optional()
}).refine(data => data.id || data.query, {
  message: 'Either id or query must be provided'
});

export const SearchSchema = z.object({
  query: z.string().max(255).optional()
});

export const GetListSchema = z.object({
  list: z.enum(['inbox', 'today', 'upcoming', 'anytime', 'someday', 'logbook', 'trash'])
});

export const GetProjectSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required')
});

export const GetAreaSchema = z.object({
  area_id: z.string().min(1, 'Area ID is required')
});
```

## Step 3: Implement Core Libraries

### 3.1 src/lib/errors.ts

```typescript
/**
 * Custom error classes for better error handling
 */

export class ThingsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ThingsError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
}

export class ThingsNotFoundError extends ThingsError {
  constructor(itemType: string, id: string) {
    super(
      `${itemType} not found: ${id}`,
      'NOT_FOUND',
      { itemType, id }
    );
  }
}

export class ThingsAuthError extends ThingsError {
  constructor(message = 'Authentication failed') {
    super(
      `${message}. Please check your THINGS_AUTH_TOKEN in MCP settings.`,
      'AUTH_ERROR'
    );
  }
}

export class ThingsValidationError extends ThingsError {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      { field }
    );
  }
}

export class ThingsTimeoutError extends ThingsError {
  constructor(operation: string, timeout: number) {
    super(
      `Operation timed out after ${timeout}ms: ${operation}`,
      'TIMEOUT',
      { operation, timeout }
    );
  }
}

export class ThingsScriptError extends ThingsError {
  constructor(scriptName: string, error: string) {
    super(
      `AppleScript execution failed: ${scriptName}`,
      'SCRIPT_ERROR',
      { scriptName, error }
    );
  }
}
```

### 3.2 src/lib/validation.ts

```typescript
/**
 * Input validation utilities
 */

// Validate and sanitize AppleScript arguments
export function validateAppleScriptArg(arg: string, fieldName: string): string {
  // Only allow alphanumeric, spaces, hyphens, underscores, @ and dots
  const safePattern = /^[\w\s\-\.@]+$/;
  
  if (!arg) {
    throw new ThingsValidationError(`${fieldName} cannot be empty`);
  }
  
  if (arg.length > 255) {
    throw new ThingsValidationError(`${fieldName} is too long (max 255 characters)`);
  }
  
  if (!safePattern.test(arg)) {
    throw new ThingsValidationError(
      `${fieldName} contains invalid characters. Only letters, numbers, spaces, hyphens, dots, and @ are allowed.`,
      fieldName
    );
  }
  
  return arg;
}

// Validate Things ID format
export function validateThingsId(id: string): string {
  // Things IDs are typically UUID-like
  const idPattern = /^[A-F0-9\-]{36}$/i;
  
  if (!idPattern.test(id)) {
    throw new ThingsValidationError(
      'Invalid Things ID format. Expected format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
      'id'
    );
  }
  
  return id;
}

// Sanitize string for URL encoding
export function sanitizeForUrl(value: string): string {
  // Remove any control characters
  return value.replace(/[\x00-\x1F\x7F]/g, '');
}
```

### 3.3 src/lib/auth.ts

```typescript
import { ThingsAuthError } from './errors.js';

/**
 * Authentication token management
 */

export function getAuthToken(): string {
  const token = process.env.THINGS_AUTH_TOKEN;
  
  if (!token) {
    throw new ThingsAuthError(
      'THINGS_AUTH_TOKEN not configured. ' +
      'Get your token from Things → Settings → General → Enable Things URLs → Manage'
    );
  }
  
  // Basic validation of token format
  if (token.length < 10 || !/^[A-Za-z0-9\-_]+$/.test(token)) {
    throw new ThingsAuthError('Invalid auth token format');
  }
  
  return token;
}

export function requiresAuth(command: string): boolean {
  return ['update', 'update-project'].includes(command);
}
```

### 3.4 src/lib/urlscheme.ts

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { getAuthToken, requiresAuth } from './auth.js';
import { sanitizeForUrl } from './validation.js';
import { ThingsError } from './errors.js';

const execAsync = promisify(exec);

const MAX_URL_LENGTH = 2048; // Safe URL length limit

export async function executeThingsURL(
  command: string, 
  params: Record<string, any>
): Promise<void> {
  const queryParams: string[] = [];
  
  // Add auth token if required
  if (requiresAuth(command)) {
    queryParams.push(`auth-token=${encodeURIComponent(getAuthToken())}`);
  }
  
  // Process parameters
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    
    let paramString = '';
    
    if (Array.isArray(value)) {
      // Handle arrays
      if (key === 'tags' || key === 'tag_names') {
        const sanitized = value.map(v => sanitizeForUrl(String(v)));
        paramString = `tags=${encodeURIComponent(sanitized.join(','))}`;
      } else if (key === 'checklist_items') {
        const sanitized = value.map(v => sanitizeForUrl(String(v)));
        paramString = `checklist-items=${encodeURIComponent(sanitized.join('\n'))}`;
      } else if (key === 'todos') {
        const sanitized = value.map(v => sanitizeForUrl(String(v)));
        paramString = `to-dos=${encodeURIComponent(sanitized.join('\n'))}`;
      } else if (key === 'filter') {
        const sanitized = value.map(v => sanitizeForUrl(String(v)));
        paramString = `filter=${encodeURIComponent(sanitized.join(','))}`;
      }
    } else if (typeof value === 'boolean') {
      paramString = `${key.replace(/_/g, '-')}=${value}`;
    } else {
      // Convert snake_case to kebab-case
      const paramName = key.replace(/_/g, '-');
      const sanitized = sanitizeForUrl(String(value));
      paramString = `${paramName}=${encodeURIComponent(sanitized)}`;
    }
    
    if (paramString) {
      queryParams.push(paramString);
    }
  }
  
  // Construct full URL
  const url = `things:///${command}?${queryParams.join('&')}`;
  
  // Check URL length
  if (url.length > MAX_URL_LENGTH) {
    throw new ThingsError(
      'URL too long. Consider using fewer items or shorter text.',
      'URL_TOO_LONG',
      { length: url.length, max: MAX_URL_LENGTH }
    );
  }
  
  // Execute
  try {
    await execAsync(`open "${url}"`, { timeout: 5000 });
  } catch (error) {
    throw new ThingsError(
      `Failed to execute Things URL: ${error}`,
      'URL_EXECUTION_FAILED',
      { command, error: String(error) }
    );
  }
}
```

### 3.5 src/lib/applescript.ts

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateAppleScriptArg } from './validation.js';
import { ThingsScriptError, ThingsTimeoutError } from './errors.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ExecuteOptions {
  timeout?: number;  // in milliseconds
  maxResults?: number;
}

/**
 * Execute AppleScript file with arguments (SECURE VERSION)
 * This is the only method we use - no string interpolation
 */
export async function executeAppleScriptFile(
  scriptName: string,
  args: string[] = [],
  options: ExecuteOptions = {}
): Promise<string> {
  const { timeout = 30000, maxResults } = options;
  const scriptPath = path.join(__dirname, '..', 'scripts', `${scriptName}.applescript`);
  
  // Validate script exists
  try {
    await readFile(scriptPath, 'utf-8');
  } catch (error) {
    throw new ThingsScriptError(scriptName, 'Script file not found');
  }
  
  // Validate and sanitize all arguments
  const safeArgs = args.map((arg, index) => 
    validateAppleScriptArg(arg, `argument[${index}]`)
  );
  
  // Add maxResults as first argument if specified
  if (maxResults !== undefined) {
    safeArgs.unshift(String(maxResults));
  }
  
  // Build command with proper escaping
  // Using single quotes and escaping any single quotes in arguments
  const quotedArgs = safeArgs.map(arg => `'${arg.replace(/'/g, "'\"'\"'")}'`);
  const command = `osascript "${scriptPath}" ${quotedArgs.join(' ')}`;
  
  try {
    const { stdout, stderr } = await execAsync(command, { 
      timeout,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large lists
    });
    
    if (stderr) {
      console.warn(`AppleScript warning (${scriptName}):`, stderr);
    }
    
    return stdout.trim();
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT') {
      throw new ThingsTimeoutError(scriptName, timeout);
    }
    
    throw new ThingsScriptError(
      scriptName, 
      error.stderr || error.message || 'Unknown error'
    );
  }
}

/**
 * Test if Things 3 is installed and accessible
 */
export async function testThingsAvailable(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      'osascript -e \'tell application "System Events" to name of application processes\'',
      { timeout: 5000 }
    );
    return stdout.includes('Things3');
  } catch {
    return false;
  }
}
```

### 3.6 src/lib/parser.ts

```typescript
import { ThingsTodo, ThingsProject, ThingsArea, ThingsTag } from '../types/things.js';

/**
 * Robust parsers for AppleScript output with error handling
 */

interface ParseOptions {
  strict?: boolean;  // Throw on malformed lines vs skip them
  logger?: (message: string) => void;
}

const defaultLogger = (message: string) => console.warn(`Parser warning: ${message}`);

export function parseTodoList(
  output: string, 
  options: ParseOptions = {}
): ThingsTodo[] {
  const { strict = false, logger = defaultLogger } = options;
  const lines = output.split('\n').filter(line => line.trim());
  const todos: ThingsTodo[] = [];
  
  for (const [index, line] of lines.entries()) {
    try {
      const parts = line.split('|');
      
      // Validate format
      if (parts.length < 3) {
        const msg = `Line ${index + 1} has invalid format (expected at least 3 parts): "${line}"`;
        if (strict) throw new Error(msg);
        logger(msg);
        continue;
      }
      
      const [id, name, area, tags] = parts;
      
      // Validate required fields
      if (!id?.trim() || !name?.trim()) {
        const msg = `Line ${index + 1} missing required fields (id/name): "${line}"`;
        if (strict) throw new Error(msg);
        logger(msg);
        continue;
      }
      
      todos.push({
        id: id.trim(),
        name: name.trim(),
        area: area?.trim() || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
    } catch (error) {
      const msg = `Failed to parse line ${index + 1}: ${error}`;
      if (strict) throw new Error(msg);
      logger(msg);
    }
  }
  
  return todos;
}

export function parseProjectList(
  output: string,
  options: ParseOptions = {}
): ThingsProject[] {
  // Projects have same format as todos
  return parseTodoList(output, options) as ThingsProject[];
}

export function parseAreaList(
  output: string,
  options: ParseOptions = {}
): ThingsArea[] {
  const { strict = false, logger = defaultLogger } = options;
  const lines = output.split('\n').filter(line => line.trim());
  const areas: ThingsArea[] = [];
  
  for (const [index, line] of lines.entries()) {
    try {
      const parts = line.split('|');
      
      if (parts.length < 2) {
        const msg = `Line ${index + 1} has invalid format (expected 2 parts): "${line}"`;
        if (strict) throw new Error(msg);
        logger(msg);
        continue;
      }
      
      const [id, name] = parts;
      
      if (!id?.trim() || !name?.trim()) {
        const msg = `Line ${index + 1} missing required fields: "${line}"`;
        if (strict) throw new Error(msg);
        logger(msg);
        continue;
      }
      
      areas.push({
        id: id.trim(),
        name: name.trim()
      });
    } catch (error) {
      const msg = `Failed to parse line ${index + 1}: ${error}`;
      if (strict) throw new Error(msg);
      logger(msg);
    }
  }
  
  return areas;
}

export function parseTagList(
  output: string,
  options: ParseOptions = {}
): ThingsTag[] {
  const { strict = false, logger = defaultLogger } = options;
  const lines = output.split('\n').filter(line => line.trim());
  const tags: ThingsTag[] = [];
  
  for (const [index, line] of lines.entries()) {
    try {
      const parts = line.split('|');
      
      if (parts.length < 2) {
        const msg = `Line ${index + 1} has invalid format (expected at least 2 parts): "${line}"`;
        if (strict) throw new Error(msg);
        logger(msg);
        continue;
      }
      
      const [id, name, parent] = parts;
      
      if (!id?.trim() || !name?.trim()) {
        const msg = `Line ${index + 1} missing required fields: "${line}"`;
        if (strict) throw new Error(msg);
        logger(msg);
        continue;
      }
      
      tags.push({
        id: id.trim(),
        name: name.trim(),
        parent: parent?.trim() || undefined
      });
    } catch (error) {
      const msg = `Failed to parse line ${index + 1}: ${error}`;
      if (strict) throw new Error(msg);
      logger(msg);
    }
  }
  
  return tags;
}
```

## Step 4: Create AppleScript Files

### 4.1 src/scripts/get-inbox.applescript

```applescript
on run argv
    -- Optional max results parameter
    set maxResults to -1
    if (count of argv) > 0 then
        try
            set maxResults to (item 1 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set todoCount to 0
        
        repeat with toDo in to dos of list "Inbox"
            -- Check max results limit
            if maxResults > 0 and todoCount ≥ maxResults then
                exit repeat
            end if
            
            try
                set todoId to id of toDo
                set todoName to name of toDo
                
                -- Get area name if exists
                set todoArea to ""
                if area of toDo is not missing value then
                    set todoArea to name of area of toDo
                end if
                
                -- Get tag names
                set todoTags to ""
                if (count of tags of toDo) > 0 then
                    set tagNames to {}
                    repeat with aTag in tags of toDo
                        set end of tagNames to name of aTag
                    end repeat
                    set AppleScript's text item delimiters to ","
                    set todoTags to tagNames as string
                    set AppleScript's text item delimiters to ""
                end if
                
                -- Build output line
                set output to output & todoId & "|" & todoName & "|" & todoArea & "|" & todoTags & linefeed
                set todoCount to todoCount + 1
                
            on error errMsg
                -- Log error but continue processing
                log "Error processing todo: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run
```

### 4.2 src/scripts/get-projects.applescript

```applescript
on run argv
    -- Optional max results parameter
    set maxResults to -1
    if (count of argv) > 0 then
        try
            set maxResults to (item 1 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set projCount to 0
        
        repeat with proj in projects
            -- Check max results limit
            if maxResults > 0 and projCount ≥ maxResults then
                exit repeat
            end if
            
            try
                -- Only include open projects
                if status of proj is open then
                    set projId to id of proj
                    set projName to name of proj
                    
                    -- Get area name if exists
                    set projArea to ""
                    if area of proj is not missing value then
                        set projArea to name of area of proj
                    end if
                    
                    -- Get tag names
                    set projTags to ""
                    if (count of tags of proj) > 0 then
                        set tagNames to {}
                        repeat with aTag in tags of proj
                            set end of tagNames to name of aTag
                        end repeat
                        set AppleScript's text item delimiters to ","
                        set projTags to tagNames as string
                        set AppleScript's text item delimiters to ""
                    end if
                    
                    -- Build output line
                    set output to output & projId & "|" & projName & "|" & projArea & "|" & projTags & linefeed
                    set projCount to projCount + 1
                end if
                
            on error errMsg
                log "Error processing project: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run
```

### 4.3 src/scripts/get-project-todos.applescript

```applescript
on run argv
    if (count of argv) < 1 then
        error "Project ID required"
    end if
    
    set projectId to item 1 of argv
    set maxResults to -1
    
    -- Check for optional max results parameter
    if (count of argv) > 1 then
        try
            set maxResults to (item 2 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set todoCount to 0
        
        -- Find project by ID
        set targetProject to missing value
        repeat with proj in projects
            if id of proj is equal to projectId then
                set targetProject to proj
                exit repeat
            end if
        end repeat
        
        if targetProject is missing value then
            error "Project not found: " & projectId
        end if
        
        -- Get todos from project
        repeat with toDo in to dos of targetProject
            -- Check max results limit
            if maxResults > 0 and todoCount ≥ maxResults then
                exit repeat
            end if
            
            try
                set todoId to id of toDo
                set todoName to name of toDo
                
                -- Project todos don't have separate area
                set todoArea to ""
                
                -- Get tag names
                set todoTags to ""
                if (count of tags of toDo) > 0 then
                    set tagNames to {}
                    repeat with aTag in tags of toDo
                        set end of tagNames to name of aTag
                    end repeat
                    set AppleScript's text item delimiters to ","
                    set todoTags to tagNames as string
                    set AppleScript's text item delimiters to ""
                end if
                
                -- Build output line
                set output to output & todoId & "|" & todoName & "|" & todoArea & "|" & todoTags & linefeed
                set todoCount to todoCount + 1
                
            on error errMsg
                log "Error processing todo: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run
```

### 4.4 src/scripts/get-areas.applescript

```applescript
on run argv
    tell application "Things3"
        set output to ""
        
        repeat with ar in areas
            try
                set arId to id of ar
                set arName to name of ar
                set output to output & arId & "|" & arName & linefeed
            on error errMsg
                log "Error processing area: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run
```

### 4.5 src/scripts/get-tags.applescript

```applescript
on run argv
    tell application "Things3"
        set output to ""
        
        repeat with tg in tags
            try
                set tgId to id of tg
                set tgName to name of tg
                
                -- Get parent tag name if exists
                set tgParent to ""
                if parent tag of tg is not missing value then
                    set tgParent to name of parent tag of tg
                end if
                
                set output to output & tgId & "|" & tgName & "|" & tgParent & linefeed
            on error errMsg
                log "Error processing tag: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run
```

### Create similar scripts for:
- `get-today.applescript` - Use `to dos of list "Today"`
- `get-upcoming.applescript` - Use `to dos of list "Upcoming"`
- `get-anytime.applescript` - Use `to dos of list "Anytime"`
- `get-someday.applescript` - Use `to dos of list "Someday"`
- `get-area-items.applescript` - Similar to get-project-todos but for areas

## Step 5: Implement MCP Tools

### 5.1 src/tools/add.ts

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeThingsURL } from '../lib/urlscheme.js';
import { AddTodoSchema, AddProjectSchema } from '../types/mcp.js';
import { ThingsError } from '../lib/errors.js';

export const addTools: Tool[] = [
  {
    name: 'things_add',
    description: 'Create a new to-do in Things 3',
    inputSchema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          description: 'Title of the to-do (required)' 
        },
        notes: { 
          type: 'string', 
          description: 'Notes for the to-do (max 10,000 characters)' 
        },
        when: { 
          type: 'string', 
          description: 'When to do it: today, tomorrow, evening, anytime, someday, or YYYY-MM-DD date',
          enum: ['today', 'tomorrow', 'evening', 'anytime', 'someday']
        },
        deadline: { 
          type: 'string', 
          description: 'Deadline date in YYYY-MM-DD format' 
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Tags to assign (will be created if they don\'t exist)'
        },
        checklist_items: {
          type: 'array',
          items: { type: 'string' },
          description: 'Checklist items to add (max 100 items)'
        },
        list_id: { 
          type: 'string', 
          description: 'ID of project/area to add to (use things_get_projects/areas to find IDs)' 
        },
        list: { 
          type: 'string', 
          description: 'Name of project/area to add to' 
        },
        heading: { 
          type: 'string', 
          description: 'Heading within project to add under' 
        },
        completed: { 
          type: 'boolean', 
          description: 'Create as completed' 
        },
        canceled: { 
          type: 'boolean', 
          description: 'Create as canceled' 
        }
      },
      required: ['title']
    }
  },
  {
    name: 'things_add_project',
    description: 'Create a new project in Things 3',
    inputSchema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          description: 'Title of the project (required)' 
        },
        notes: { 
          type: 'string', 
          description: 'Notes for the project (max 10,000 characters)' 
        },
        when: { 
          type: 'string', 
          description: 'When to start: today, tomorrow, evening, anytime, someday, or YYYY-MM-DD date'
        },
        deadline: { 
          type: 'string', 
          description: 'Deadline date in YYYY-MM-DD format' 
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Tags to assign'
        },
        area_id: { 
          type: 'string', 
          description: 'ID of area to add to' 
        },
        area: { 
          type: 'string', 
          description: 'Name of area to add to' 
        },
        todos: {
          type: 'array',
          items: { type: 'string' },
          description: 'To-dos to create in the project (max 100)'
        },
        completed: { 
          type: 'boolean', 
          description: 'Create as completed' 
        },
        canceled: { 
          type: 'boolean', 
          description: 'Create as canceled' 
        }
      },
      required: ['title']
    }
  }
];

export async function handleAdd(toolName: string, args: any): Promise<any> {
  try {
    if (toolName === 'things_add') {
      const params = AddTodoSchema.parse(args);
      await executeThingsURL('add', params);
      return { 
        success: true, 
        message: 'To-do created successfully',
        data: { title: params.title }
      };
    } else if (toolName === 'things_add_project') {
      const params = AddProjectSchema.parse(args);
      await executeThingsURL('add-project', params);
      return { 
        success: true, 
        message: 'Project created successfully',
        data: { title: params.title }
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
```

### 5.2 src/tools/get.ts

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeAppleScriptFile } from '../lib/applescript.js';
import { parseTodoList, parseProjectList, parseAreaList, parseTagList } from '../lib/parser.js';
import { GetProjectSchema, GetAreaSchema } from '../types/mcp.js';
import { ThingsError, ThingsNotFoundError } from '../lib/errors.js';

export const getTools: Tool[] = [
  {
    name: 'things_get_inbox',
    description: 'Get all to-dos in the Inbox',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { 
          type: 'number', 
          description: 'Maximum number of results to return' 
        }
      } 
    }
  },
  {
    name: 'things_get_today',
    description: 'Get all to-dos scheduled for Today',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_upcoming',
    description: 'Get all scheduled to-dos (with dates)',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_anytime',
    description: 'Get all to-dos in Anytime',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_someday',
    description: 'Get all to-dos in Someday',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_projects',
    description: 'Get all active projects',
    inputSchema: { 
      type: 'object', 
      properties: {
        max_results: { type: 'number' }
      } 
    }
  },
  {
    name: 'things_get_areas',
    description: 'Get all areas',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'things_get_tags',
    description: 'Get all tags',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'things_get_project',
    description: 'Get all to-dos in a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { 
          type: 'string', 
          description: 'ID of the project (get from things_get_projects)' 
        },
        max_results: { type: 'number' }
      },
      required: ['project_id']
    }
  },
  {
    name: 'things_get_area',
    description: 'Get all items in a specific area',
    inputSchema: {
      type: 'object',
      properties: {
        area_id: { 
          type: 'string', 
          description: 'ID of the area (get from things_get_areas)' 
        },
        max_results: { type: 'number' }
      },
      required: ['area_id']
    }
  }
];

const scriptMap: Record<string, string> = {
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

export async function handleGet(toolName: string, args: any): Promise<any> {
  try {
    const scriptName = scriptMap[toolName];
    if (!scriptName) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    let scriptArgs: string[] = [];
    let options = { maxResults: args.max_results };
    
    // Handle specific tools that need arguments
    if (toolName === 'things_get_project') {
      const params = GetProjectSchema.parse(args);
      scriptArgs = [params.project_id];
    } else if (toolName === 'things_get_area') {
      const params = GetAreaSchema.parse(args);
      scriptArgs = [params.area_id];
    }
    
    const output = await executeAppleScriptFile(scriptName, scriptArgs, options);
    
    // Return empty array for empty output
    if (!output.trim()) {
      return toolName.includes('project') || toolName.includes('area') 
        ? { todos: [] }
        : { [getResultKey(toolName)]: [] };
    }
    
    // Parse based on tool type
    switch (toolName) {
      case 'things_get_projects':
        return { projects: parseProjectList(output) };
      case 'things_get_areas':
        return { areas: parseAreaList(output) };
      case 'things_get_tags':
        return { tags: parseTagList(output) };
      default:
        return { todos: parseTodoList(output) };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ThingsError(
        'Invalid parameters',
        'VALIDATION_ERROR',
        error.errors
      );
    }
    
    // Handle "not found" errors from AppleScript
    if (error instanceof ThingsError && error.message.includes('not found')) {
      const match = error.message.match(/not found: (.+)/);
      if (match) {
        throw new ThingsNotFoundError(
          toolName.includes('project') ? 'Project' : 'Area',
          match[1]
        );
      }
    }
    
    throw error;
  }
}

function getResultKey(toolName: string): string {
  if (toolName.includes('project')) return 'projects';
  if (toolName.includes('area')) return 'areas';
  if (toolName.includes('tag')) return 'tags';
  return 'todos';
}
```

### 5.3 src/tools/show.ts

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeThingsURL } from '../lib/urlscheme.js';
import { ShowSchema } from '../types/mcp.js';
import { ThingsError } from '../lib/errors.js';

export const showTools: Tool[] = [
  {
    name: 'things_show',
    description: 'Navigate to and show an item or list in Things 3',
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'ID of item or built-in list: inbox, today, anytime, upcoming, someday, logbook, tomorrow, deadlines, repeating, all-projects, logged-projects' 
        },
        query: { 
          type: 'string', 
          description: 'Name of area, project, tag or built-in list to show' 
        },
        filter: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to filter the view by'
        }
      }
    }
  }
];

export async function handleShow(toolName: string, args: any): Promise<any> {
  try {
    const params = ShowSchema.parse(args);
    await executeThingsURL('show', params);
    
    return { 
      success: true, 
      message: 'Navigated to item/list',
      data: { 
        target: params.id || params.query,
        filtered: params.filter ? true : false
      }
    };
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
```

### 5.4 src/tools/search.ts

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { executeThingsURL } from '../lib/urlscheme.js';
import { SearchSchema } from '../types/mcp.js';
import { ThingsError } from '../lib/errors.js';

export const searchTools: Tool[] = [
  {
    name: 'things_search',
    description: 'Open search in Things 3',
    inputSchema: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          description: 'Search query (leave empty to just open search)' 
        }
      }
    }
  }
];

export async function handleSearch(toolName: string, args: any): Promise<any> {
  try {
    const params = SearchSchema.parse(args);
    await executeThingsURL('search', params);
    
    return { 
      success: true, 
      message: params.query 
        ? `Search opened with query: ${params.query}`
        : 'Search opened'
    };
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
```

## Step 6: Implement MCP Server

### 6.1 src/index.ts

```typescript
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
```

## Step 7: Create Documentation

### 7.1 README.md

```markdown
# Things MCP

A secure and robust MCP (Model Context Protocol) server for Things 3 integration. Enables Claude Desktop and Claude Code to interact with Things 3 on macOS.

## Features

- ✅ Create to-dos and projects with full metadata
- ✅ List items from any Things list (Inbox, Today, etc.)
- ✅ Retrieve all projects, areas, and tags
- ✅ Navigate to specific items or lists
- ✅ Search within Things
- 🔒 Secure AppleScript execution
- 🚀 Optimized performance with configurable limits
- 🛡️ Comprehensive error handling

## Requirements

- macOS with Things 3 installed
- Node.js 18 or later
- Things URL scheme enabled (automatic on first use)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/things-mcp.git
   cd things-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

1. **Get your Things auth token** (for update operations):
   - Open Things → Settings → General
   - Enable Things URLs
   - Click Manage → Copy Token

2. **Add to your Claude MCP settings**:
   ```json
   {
     "things-mcp": {
       "command": "node",
       "args": ["/absolute/path/to/things-mcp/dist/index.js"],
       "env": {
         "THINGS_AUTH_TOKEN": "your-token-here"
       }
     }
   }
   ```

   Replace `/absolute/path/to/things-mcp` with the actual path to your installation.

## Usage Examples

### Create a To-Do
```
Use things_add to create a task called "Buy milk" for today with tag "errands"
```

### Create a Project
```
Use things_add_project to create a project "Website Redesign" in area "Work" with tasks "Design mockups" and "Implement frontend"
```

### List Tasks
```
Show me all tasks in my Things inbox using things_get_inbox
```

### Get Projects with IDs
```
List all my projects using things_get_projects (this will show IDs you can use)
```

### Navigate
```
Use things_show to open my Today list
```

## Available Tools

### Creation Tools (URL Scheme)
- `things_add` - Create a to-do with all options
- `things_add_project` - Create a project with to-dos

### Reading Tools (AppleScript)
- `things_get_inbox` - List inbox items
- `things_get_today` - List today's items
- `things_get_upcoming` - List scheduled items
- `things_get_anytime` - List anytime items
- `things_get_someday` - List someday items
- `things_get_projects` - List all active projects
- `things_get_areas` - List all areas
- `things_get_tags` - List all tags
- `things_get_project` - List items in a specific project (requires project_id)
- `things_get_area` - List items in a specific area (requires area_id)

All list tools support an optional `max_results` parameter to limit output.

### Navigation Tools
- `things_show` - Navigate to item or list
- `things_search` - Open search with optional query

## Development

```bash
# Development mode with watch
npm run dev

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Troubleshooting

### "Things 3 does not appear to be running"
Make sure Things 3 is installed and has been opened at least once.

### "Authentication failed"
Check that your THINGS_AUTH_TOKEN is correctly set in the MCP configuration.

### AppleScript Permissions
On first run, macOS may ask for permission to control Things. Grant this permission for the MCP to work.

### Performance Issues
Use the `max_results` parameter when listing large collections:
```
Use things_get_projects with max_results 10
```

## Internationalization

This MCP uses English list names ("Inbox", "Today", etc.) which Things handles correctly on most systems. If you experience issues with non-English systems:

1. Ensure Things is set to English, or
2. Wait for a future update that uses list IDs

Custom projects and areas work with any language as we reference them by ID.

## Security

- All AppleScript arguments are validated and sanitized
- No string interpolation in AppleScript execution
- Auth tokens are never logged
- Input validation on all parameters
- Secure error messages that don't expose internals

## Future Enhancements

- [ ] Update existing to-dos and projects
- [ ] Bulk operations with `things_json`
- [ ] Quick Entry Panel integration
- [ ] Repeating tasks support
- [ ] Attachment handling
- [ ] List caching for performance

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Code is properly formatted
- Security considerations are addressed
- Documentation is updated

## Credits

Built with the [Model Context Protocol SDK](https://github.com/anthropics/mcp).
Things is a trademark of Cultured Code GmbH & Co. KG.
```

## Step 8: Testing Strategy

### 8.1 Unit Tests Structure

Create comprehensive tests for:

1. **Parser Tests** (`tests/unit/parser.test.ts`)
   - Valid input parsing
   - Malformed input handling
   - Edge cases (empty fields, special characters)
   - Strict vs non-strict modes

2. **Validation Tests** (`tests/unit/validation.test.ts`)
   - AppleScript argument validation
   - Things ID format validation
   - URL sanitization

3. **Error Tests** (`tests/unit/errors.test.ts`)
   - Error serialization
   - Error type checking
   - Error message formatting

### 8.2 Integration Tests

1. **URL Scheme Tests** (`tests/integration/urlscheme.test.ts`)
   - Test with mock `exec` calls
   - Verify parameter formatting
   - Test auth token inclusion

2. **AppleScript Tests** (`tests/integration/applescript.test.ts`)
   - Test with fixture data
   - Verify timeout handling
   - Test argument passing

### 8.3 End-to-End Testing

Manual testing checklist:

1. **Basic Operations**
   - [ ] Create simple to-do
   - [ ] Create to-do with all parameters
   - [ ] Create project with multiple to-dos
   - [ ] List each type of collection
   - [ ] Navigate to different views
   - [ ] Search with and without query

2. **Error Scenarios**
   - [ ] Invalid auth token
   - [ ] Non-existent project/area ID
   - [ ] Malformed input data
   - [ ] Things not running
   - [ ] Large data sets

3. **Security Testing**
   - [ ] SQL injection attempts in parameters
   - [ ] Script injection in AppleScript args
   - [ ] Path traversal attempts
   - [ ] Command injection tests

## Step 9: Production Considerations

### Performance Optimization

1. **AppleScript Caching**
   - Cache frequently accessed lists (areas, tags)
   - Implement TTL-based cache invalidation
   - Monitor memory usage

2. **Batch Operations**
   - Group multiple operations when possible
   - Implement request queuing
   - Add rate limiting if needed

3. **Large Data Handling**
   - Always use `max_results` for production
   - Implement pagination for future versions
   - Stream large results if possible

### Monitoring and Logging

1. **Structured Logging**
   - Use log levels (debug, info, warn, error)
   - Include correlation IDs
   - Log performance metrics

2. **Error Tracking**
   - Capture and categorize errors
   - Monitor error rates
   - Alert on critical failures

### Security Hardening

1. **Input Validation**
   - Validate all inputs at boundaries
   - Use allowlists over denylists
   - Sanitize for both URL and AppleScript contexts

2. **Least Privilege**
   - Only request necessary permissions
   - Validate auth tokens on every request
   - Implement request throttling

3. **Security Updates**
   - Regular dependency updates
   - Security audit schedule
   - Incident response plan

## Conclusion

This enhanced implementation guide provides a secure, robust, and maintainable Things MCP server. Key improvements include:

- **Security-first design** with no string interpolation in AppleScript
- **Comprehensive error handling** with typed errors
- **Input validation** at all boundaries
- **Performance optimization** with configurable limits
- **Better code organization** with handler maps
- **Production-ready logging** and error reporting

Follow this guide step-by-step, test thoroughly, and you'll have a professional-grade MCP server for Things 3 integration.