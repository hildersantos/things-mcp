import { exec } from 'child_process';
import { promisify } from 'util';
import { getAuthToken, requiresAuth } from './auth.js';
import { sanitizeForUrl } from './validation.js';
import { ThingsError } from './errors.js';

const execAsync = promisify(exec);

const MAX_URL_LENGTH = 2048; // Safe URL length limit for simple URLs

export async function executeThingsURL(
  command: string, 
  params: Record<string, unknown>
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
      // Skip empty arrays
      if (value.length === 0) continue;
      
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