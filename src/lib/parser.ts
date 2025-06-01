import { ThingsTodo, ThingsProject, ThingsArea, ThingsTag, ThingsTodoDetails } from '../types/things.js';

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

export function parseTodoDetails(
  output: string,
  options: ParseOptions = {}
): ThingsTodoDetails {
  const { strict = false, logger = defaultLogger } = options;
  const line = output.trim();
  
  if (!line) {
    throw new Error('Empty output for todo details');
  }
  
  const parts = line.split('|');
  
  // Expected format: id|name|area|tags|deadline|scheduledDate|status|creationDate|completionDate|project|notes
  if (parts.length < 11) {
    const msg = `Invalid format for todo details (expected 11 parts, got ${parts.length}): "${line}"`;
    if (strict) throw new Error(msg);
    logger(msg);
  }
  
  const [
    id, name, area, tags, deadline, scheduledDate, 
    status, creationDate, completionDate, project, notes
  ] = parts;
  
  if (!id?.trim() || !name?.trim()) {
    throw new Error(`Missing required fields (id/name) in todo details: "${line}"`);
  }
  
  // Helper function to convert AppleScript dates to ISO format
  const parseAppleScriptDate = (dateStr: string): string | undefined => {
    if (!dateStr || dateStr.trim() === '') return undefined;
    
    try {
      // AppleScript returns dates like "Sunday, June 1, 2025 at 12:00:00 AM"
      // Try to extract the date parts using regex
      const dateMatch = dateStr.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+)/);
      if (dateMatch) {
        const [, , monthName, day, year] = dateMatch;
        
        // Convert month name to number
        const monthMap: Record<string, string> = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        
        const monthNum = monthMap[monthName];
        if (monthNum) {
          return `${year}-${monthNum}-${day.padStart(2, '0')}`;
        }
      }
      
      // Fallback: try regular Date parsing
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return dateStr; // Return original if can't parse
    } catch {
      return dateStr; // Return original if parsing fails
    }
  };
  
  return {
    id: id.trim(),
    name: name.trim(),
    area: area?.trim() || undefined,
    tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    deadline: parseAppleScriptDate(deadline),
    scheduledDate: parseAppleScriptDate(scheduledDate),
    notes: notes?.trim() || undefined,
    status: (status?.trim() as 'open' | 'completed' | 'canceled') || 'open',
    creationDate: parseAppleScriptDate(creationDate),
    completionDate: parseAppleScriptDate(completionDate),
    project: project?.trim() || undefined
  };
}