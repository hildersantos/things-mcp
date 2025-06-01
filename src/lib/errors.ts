/**
 * Custom error classes for better error handling
 */

export class ThingsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ThingsError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
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
    // Parse common error patterns for better user messages
    const userMessage = ThingsScriptError.parseErrorMessage(error, scriptName);
    
    super(
      userMessage,
      'SCRIPT_ERROR',
      { scriptName, error }
    );
  }

  private static parseErrorMessage(error: string, scriptName: string): string {
    // Extract the actual error message from AppleScript stderr
    // Format: /path/to/script.applescript:line:char: execution error: <actual message> (code)
    const errorMatch = error.match(/execution error:\s*(.+?)\s*\(-?\d+\)/);
    
    if (errorMatch) {
      const message = errorMatch[1];
      
      // Check for common patterns and provide user-friendly messages
      if (message.includes('not found:')) {
        return message; // Already user-friendly
      }
      
      if (message.includes('Things3 is not running')) {
        return 'Things 3 is not running. Please open Things 3 and try again.';
      }
      
      // For other messages, return as-is
      return message;
    }
    
    // Fallback to generic message if we can't parse
    return `AppleScript execution failed: ${scriptName}`;
  }
}