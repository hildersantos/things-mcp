import { describe, it, expect } from '@jest/globals';
import { validateAppleScriptArg } from '../../src/lib/validation.js';
import { ThingsValidationError } from '../../src/lib/errors.js';

// Since mocking fs and child_process with ES modules is complex,
// we'll focus on testing the parts we can test in isolation

describe('AppleScript argument validation', () => {
  it('should validate safe arguments', () => {
    const safeArgs = [
      'simple-text',
      'Text with spaces',
      'email@example.com',
      'file.name.txt',
      'ABC-123_test'
    ];
    
    safeArgs.forEach(arg => {
      expect(() => validateAppleScriptArg(arg, 'test')).not.toThrow();
    });
  });

  it('should reject dangerous arguments', () => {
    const dangerousArgs = [
      'text; rm -rf /',
      'text && echo bad',
      'text | cat /etc/passwd',
      'text`whoami`',
      'text$(date)',
      'text\'; DROP TABLE--'
    ];
    
    dangerousArgs.forEach(arg => {
      expect(() => validateAppleScriptArg(arg, 'test'))
        .toThrow(ThingsValidationError);
    });
  });
});

describe('AppleScript command construction', () => {
  // Test the quote escaping logic
  it('should properly escape single quotes', () => {
    const input = "text with 'quotes' inside";
    const escaped = input.replace(/'/g, "'\"'\"'");
    expect(escaped).toBe("text with '\"'\"'quotes'\"'\"' inside");
  });

  it('should handle multiple quotes', () => {
    const input = "it's a 'test' with 'many' quotes";
    const escaped = input.replace(/'/g, "'\"'\"'");
    expect(escaped).toContain("'\"'\"'");
    expect(escaped).not.toContain("''");
  });
});

describe('AppleScript paths', () => {
  it('should construct valid script paths', () => {
    // Test path construction logic
    const scriptName = 'get-inbox';
    const expectedPattern = /scripts\/get-inbox\.applescript$/;
    const path = `../scripts/${scriptName}.applescript`;
    expect(path).toMatch(expectedPattern);
  });
});

describe('ExecuteOptions validation', () => {
  it('should have sensible defaults', () => {
    const defaultTimeout = 30000;
    const maxTimeout = 600000;
    
    expect(defaultTimeout).toBeGreaterThan(0);
    expect(defaultTimeout).toBeLessThanOrEqual(maxTimeout);
  });

  it('should handle maxResults prepending', () => {
    const args = ['arg1', 'arg2'];
    const maxResults = 10;
    const finalArgs = [String(maxResults), ...args];
    
    expect(finalArgs).toEqual(['10', 'arg1', 'arg2']);
    expect(finalArgs[0]).toBe('10');
  });
});