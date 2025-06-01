import { describe, it, expect } from '@jest/globals';
import {
  validateAppleScriptArg,
  validateThingsId,
  sanitizeForUrl
} from '../../src/lib/validation.js';
import { ThingsValidationError } from '../../src/lib/errors.js';

describe('validateAppleScriptArg', () => {
  it('should accept valid alphanumeric strings', () => {
    const valid = ['test', 'Test123', 'my-project', 'my_task', 'task.name', 'user@email.com'];
    
    valid.forEach(arg => {
      expect(() => validateAppleScriptArg(arg, 'field')).not.toThrow();
      expect(validateAppleScriptArg(arg, 'field')).toBe(arg);
    });
  });

  it('should accept strings with allowed special characters', () => {
    const result = validateAppleScriptArg('Project-2023_v1.0@final', 'field');
    expect(result).toBe('Project-2023_v1.0@final');
  });

  it('should throw for empty strings', () => {
    expect(() => validateAppleScriptArg('', 'field'))
      .toThrow(new ThingsValidationError('field cannot be empty'));
  });

  it('should throw for strings that are too long', () => {
    const longString = 'a'.repeat(256);
    expect(() => validateAppleScriptArg(longString, 'field'))
      .toThrow(new ThingsValidationError('field is too long (max 255 characters)'));
  });

  it('should throw for strings with invalid characters', () => {
    const invalid = ['test;', 'test|pipe', 'test<>', 'test$var', 'test&param', 'test#hash'];
    
    invalid.forEach(arg => {
      expect(() => validateAppleScriptArg(arg, 'testField'))
        .toThrow(new ThingsValidationError(
          'testField contains invalid characters. Only letters, numbers, spaces, hyphens, dots, and @ are allowed.',
          'testField'
        ));
    });
  });
});

describe('validateThingsId', () => {
  it('should accept valid Things ID format', () => {
    const validIds = [
      'ABC12345-1234-5678-9ABC-DEF123456789',
      'abc12345-1234-5678-9abc-def123456789',
      'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'
    ];
    
    validIds.forEach(id => {
      expect(() => validateThingsId(id)).not.toThrow();
      expect(validateThingsId(id)).toBe(id);
    });
  });

  it('should throw for invalid ID formats', () => {
    const invalidIds = [
      'not-a-valid-id',
      'ABC12345-1234-5678-9ABC-DEF12345678', // Too short
      'ABC12345-1234-5678-9ABC-DEF1234567890', // Too long
      'ABC12345-1234-5678-9ABC-DEF12345678G', // Invalid character
      'ABC12345-1234-5678-9ABC_DEF123456789', // Underscore instead of hyphen
      ''
    ];
    
    invalidIds.forEach(id => {
      expect(() => validateThingsId(id))
        .toThrow(new ThingsValidationError(
          'Invalid Things ID format. Expected format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
          'id'
        ));
    });
  });
});

describe('sanitizeForUrl', () => {
  it('should return normal strings unchanged', () => {
    expect(sanitizeForUrl('Hello World')).toBe('Hello World');
    expect(sanitizeForUrl('Test-123_ABC')).toBe('Test-123_ABC');
  });

  it('should remove control characters', () => {
    expect(sanitizeForUrl('Hello\x00World')).toBe('HelloWorld');
    expect(sanitizeForUrl('Test\x1FString')).toBe('TestString');
    expect(sanitizeForUrl('\x7FStart')).toBe('Start');
  });

  it('should handle multiple control characters', () => {
    expect(sanitizeForUrl('A\x00B\x1FC\x7FD')).toBe('ABCD');
  });

  it('should preserve regular whitespace', () => {
    expect(sanitizeForUrl('Hello World')).toBe('Hello World');
    expect(sanitizeForUrl('Line 1\nLine 2')).toBe('Line 1\nLine 2');
  });
});