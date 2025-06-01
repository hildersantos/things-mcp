import { ThingsTodo, ThingsProject, ThingsArea, ThingsTag } from '../types/things.js';

/**
 * Robust parsers for AppleScript output with error handling
 */

interface ParseOptions {
  strict?: boolean;  // Throw on malformed lines vs skip them
  logger?: (message: string) => void;
}

const defaultLogger = (message: string): void => console.warn(`Parser warning: ${message}`);

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