import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getAuthToken, requiresAuth } from '../../src/lib/auth.js';
import { ThingsAuthError } from '../../src/lib/errors.js';

describe('getAuthToken', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should return valid auth token from environment', () => {
    process.env.THINGS_AUTH_TOKEN = 'valid-token-123456789';
    
    const token = getAuthToken();
    expect(token).toBe('valid-token-123456789');
  });

  it('should throw when token is not configured', () => {
    delete process.env.THINGS_AUTH_TOKEN;
    
    expect(() => getAuthToken()).toThrow(
      new ThingsAuthError(
        'THINGS_AUTH_TOKEN not configured. ' +
        'Get your token from Things → Settings → General → Enable Things URLs → Manage'
      )
    );
  });

  it('should throw when token is too short', () => {
    process.env.THINGS_AUTH_TOKEN = 'short';
    
    expect(() => getAuthToken()).toThrow(
      new ThingsAuthError('Invalid auth token format')
    );
  });

  it('should throw when token contains invalid characters', () => {
    const invalidTokens = [
      'token-with-spaces here',
      'token@with@special',
      'token|pipe',
      'token;semicolon',
      'token$dollar'
    ];

    invalidTokens.forEach(token => {
      process.env.THINGS_AUTH_TOKEN = token;
      expect(() => getAuthToken()).toThrow(
        new ThingsAuthError('Invalid auth token format')
      );
    });
  });

  it('should accept valid token formats', () => {
    const validTokens = [
      'abcdef1234567890',
      'ABC-123-DEF-456',
      'token_with_underscores',
      'MixedCase123-Token_456'
    ];

    validTokens.forEach(token => {
      process.env.THINGS_AUTH_TOKEN = token;
      expect(() => getAuthToken()).not.toThrow();
      expect(getAuthToken()).toBe(token);
    });
  });
});

describe('requiresAuth', () => {
  it('should return true for commands that need authentication', () => {
    expect(requiresAuth('update')).toBe(true);
    expect(requiresAuth('update-project')).toBe(true);
  });

  it('should return false for commands that do not need authentication', () => {
    expect(requiresAuth('add')).toBe(false);
    expect(requiresAuth('add-project')).toBe(false);
    expect(requiresAuth('show')).toBe(false);
    expect(requiresAuth('search')).toBe(false);
    expect(requiresAuth('any-other-command')).toBe(false);
  });
});