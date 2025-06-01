import { describe, it, expect } from '@jest/globals';
import {
  ThingsError,
  ThingsNotFoundError,
  ThingsAuthError,
  ThingsValidationError,
  ThingsTimeoutError,
  ThingsScriptError
} from '../../src/lib/errors.js';

describe('ThingsError', () => {
  it('should create error with message and code', () => {
    const error = new ThingsError('Something went wrong', 'GENERIC_ERROR');
    
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('GENERIC_ERROR');
    expect(error.name).toBe('ThingsError');
    expect(error.details).toBeUndefined();
  });

  it('should include details when provided', () => {
    const details = { field: 'title', value: 'test' };
    const error = new ThingsError('Validation failed', 'VALIDATION_ERROR', details);
    
    expect(error.details).toEqual(details);
  });

  it('should serialize to JSON properly', () => {
    const error = new ThingsError('Test error', 'TEST_CODE', { extra: 'data' });
    const json = error.toJSON();
    
    expect(json).toEqual({
      name: 'ThingsError',
      message: 'Test error',
      code: 'TEST_CODE',
      details: { extra: 'data' }
    });
  });
});

describe('ThingsNotFoundError', () => {
  it('should format not found message correctly', () => {
    const error = new ThingsNotFoundError('Project', 'ABC-123');
    
    expect(error.message).toBe('Project not found: ABC-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.details).toEqual({ itemType: 'Project', id: 'ABC-123' });
  });
});

describe('ThingsAuthError', () => {
  it('should use default message when none provided', () => {
    const error = new ThingsAuthError();
    
    expect(error.message).toBe('Authentication failed. Please check your THINGS_AUTH_TOKEN in MCP settings.');
    expect(error.code).toBe('AUTH_ERROR');
  });

  it('should include custom message when provided', () => {
    const error = new ThingsAuthError('Invalid token format');
    
    expect(error.message).toBe('Invalid token format. Please check your THINGS_AUTH_TOKEN in MCP settings.');
  });
});

describe('ThingsValidationError', () => {
  it('should create validation error without field', () => {
    const error = new ThingsValidationError('Invalid input');
    
    expect(error.message).toBe('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual({ field: undefined });
  });

  it('should include field when provided', () => {
    const error = new ThingsValidationError('Title too long', 'title');
    
    expect(error.details).toEqual({ field: 'title' });
  });
});

describe('ThingsTimeoutError', () => {
  it('should format timeout message correctly', () => {
    const error = new ThingsTimeoutError('get-inbox', 30000);
    
    expect(error.message).toBe('Operation timed out after 30000ms: get-inbox');
    expect(error.code).toBe('TIMEOUT');
    expect(error.details).toEqual({ operation: 'get-inbox', timeout: 30000 });
  });
});

describe('ThingsScriptError', () => {
  it('should format script error message correctly', () => {
    const error = new ThingsScriptError('get-projects', 'Script execution failed');
    
    expect(error.message).toBe('AppleScript execution failed: get-projects');
    expect(error.code).toBe('SCRIPT_ERROR');
    expect(error.details).toEqual({ 
      scriptName: 'get-projects', 
      error: 'Script execution failed' 
    });
  });
});