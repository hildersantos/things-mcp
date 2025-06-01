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
    super(
      `AppleScript execution failed: ${scriptName}`,
      'SCRIPT_ERROR',
      { scriptName, error }
    );
  }
}