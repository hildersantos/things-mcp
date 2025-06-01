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
  } catch {
    throw new ThingsScriptError(scriptName, 'Script file not found');
  }
  
  // Validate and sanitize all arguments
  const safeArgs = args.map((arg, index) => 
    validateAppleScriptArg(arg, `argument[${index}]`)
  );
  
  // Add maxResults as last argument if specified
  if (maxResults !== undefined) {
    safeArgs.push(String(maxResults));
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
  } catch (error: unknown) {
    const errorObj = error as { code?: string; stderr?: string; message?: string };
    
    if (errorObj.code === 'ETIMEDOUT') {
      throw new ThingsTimeoutError(scriptName, timeout);
    }
    
    throw new ThingsScriptError(
      scriptName, 
      errorObj.stderr || errorObj.message || 'Unknown error'
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