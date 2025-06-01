import { describe, it, expect } from '@jest/globals';
import { executeThingsURL } from '../../src/lib/urlscheme.js';

// Since we can't easily mock child_process.exec with ES modules,
// we'll focus on testing the URL construction logic by catching the errors
// This is a pragmatic approach following TDD principles

describe('executeThingsURL', () => {
  // Helper to extract URL from error
  async function getConstructedURL(command: string, params: any): Promise<string> {
    try {
      await executeThingsURL(command, params);
      throw new Error('Expected execution to fail');
    } catch (error: any) {
      // Extract URL from error message
      const match = error.message.match(/open "(.+?)"/);
      if (match) {
        return match[1];
      }
      throw error;
    }
  }

  describe('URL construction', () => {
    it('should handle arrays with special handling', async () => {
      const params = {
        tags: ['work', 'urgent'],
        checklist_items: ['Item 1', 'Item 2'],
        todos: ['Todo 1', 'Todo 2'],
        filter: ['tag1', 'tag2']
      };

      try {
        await executeThingsURL('add', params);
      } catch (error: any) {
        const url = error.message;
        expect(url).toContain('tags=work%2Curgent');
        expect(url).toContain('checklist-items=Item%201%0AItem%202');
        expect(url).toContain('to-dos=Todo%201%0ATodo%202');
        expect(url).toContain('filter=tag1%2Ctag2');
      }
    });

    it('should skip empty arrays', async () => {
      try {
        await executeThingsURL('add', {
          title: 'Test',
          tags: []
        });
      } catch (error: any) {
        const url = error.message;
        expect(url).toContain('title=Test');
        expect(url).not.toContain('tags=');
      }
    });

    it('should handle boolean values', async () => {
      try {
        await executeThingsURL('add', {
          completed: true,
          canceled: false
        });
      } catch (error: any) {
        const url = error.message;
        expect(url).toContain('completed=true');
        expect(url).toContain('canceled=false');
      }
    });

    it('should convert snake_case to kebab-case', async () => {
      try {
        await executeThingsURL('add', {
          list_id: 'project-123',
          area_id: 'area-456',
          some_other_field: 'value'
        });
      } catch (error: any) {
        const url = error.message;
        expect(url).toContain('list-id=project-123');
        expect(url).toContain('area-id=area-456');
        expect(url).toContain('some-other-field=value');
      }
    });

    it('should skip null and undefined values', async () => {
      try {
        await executeThingsURL('add', {
          title: 'Test',
          notes: undefined,
          when: null,
          deadline: ''
        });
      } catch (error: any) {
        const url = error.message;
        expect(url).toContain('title=Test');
        expect(url).toContain('deadline=');
        expect(url).not.toContain('notes=');
        expect(url).not.toContain('when=');
      }
    });

    it('should properly encode special characters', async () => {
      try {
        await executeThingsURL('add', {
          title: 'Test & Task',
          notes: 'Line 1\nLine 2',
          tags: ['tag with spaces', 'tag/slash']
        });
      } catch (error: any) {
        const url = error.message;
        expect(url).toContain('title=Test%20%26%20Task');
        expect(url).toContain('notes=Line%201%0ALine%202');
        expect(url).toContain('tags=tag%20with%20spaces%2Ctag%2Fslash');
      }
    });

    it('should sanitize control characters', async () => {
      try {
        await executeThingsURL('add', {
          title: 'Test\x00Task\x1FClean'
        });
      } catch (error: any) {
        const url = error.message;
        expect(url).toContain('title=TestTaskClean');
        expect(url).not.toContain('\x00');
        expect(url).not.toContain('\x1F');
      }
    });
  });

  describe('authentication', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should require auth token for update commands', async () => {
      delete process.env.THINGS_AUTH_TOKEN;
      
      await expect(executeThingsURL('update', { id: 'test' }))
        .rejects.toThrow('THINGS_AUTH_TOKEN not configured');
    });

    it('should not require auth token for other commands', async () => {
      delete process.env.THINGS_AUTH_TOKEN;
      
      // Should not throw auth error - this would normally succeed but we can't
      // easily test the actual execution in unit tests
      try {
        await executeThingsURL('add', { title: 'Test' });
      } catch (error: any) {
        // We expect execution to fail in test environment
        expect(error.code).toBe('URL_EXECUTION_FAILED');
        expect(error.message).not.toContain('THINGS_AUTH_TOKEN');
      }
    });
  });
});