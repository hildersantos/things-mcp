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

export function requiresAuth(_command: string): boolean {
  // Auth is now handled at the operation level for JSON commands
  // Only URL scheme commands that explicitly require auth would be listed here
  return false;
}