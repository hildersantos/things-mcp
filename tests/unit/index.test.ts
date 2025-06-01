import { describe, it, expect } from '@jest/globals';

describe('MCP Server', () => {
  describe('Tool imports', () => {
    it('should import all tool modules without errors', async () => {
      const { addTools } = await import('../../src/tools/add.js');
      const { getTools } = await import('../../src/tools/get.js');
      const { showTools } = await import('../../src/tools/show.js');
      const { searchTools } = await import('../../src/tools/search.js');
      
      expect(addTools).toBeDefined();
      expect(getTools).toBeDefined();
      expect(showTools).toBeDefined();
      expect(searchTools).toBeDefined();
    });

    it('should have expected number of tools in each category', async () => {
      const { addTools } = await import('../../src/tools/add.js');
      const { getTools } = await import('../../src/tools/get.js');
      const { showTools } = await import('../../src/tools/show.js');
      const { searchTools } = await import('../../src/tools/search.js');
      
      expect(addTools.length).toBe(2);
      expect(getTools.length).toBeGreaterThan(5);
      expect(showTools.length).toBe(1);
      expect(searchTools.length).toBe(1);
    });

    it('should create combined tool list with unique names', async () => {
      const { addTools } = await import('../../src/tools/add.js');
      const { getTools } = await import('../../src/tools/get.js');
      const { showTools } = await import('../../src/tools/show.js');
      const { searchTools } = await import('../../src/tools/search.js');
      
      const allTools = [...addTools, ...getTools, ...showTools, ...searchTools];
      const toolNames = allTools.map(tool => tool.name);
      const uniqueNames = new Set(toolNames);
      
      expect(toolNames.length).toBe(uniqueNames.size);
    });
  });

  describe('Error handling types', () => {
    it('should import ThingsError', async () => {
      const { ThingsError } = await import('../../src/lib/errors.js');
      
      const error = new ThingsError('Test message', 'TEST_CODE');
      expect(error.name).toBe('ThingsError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
    });
  });

  describe('Library modules', () => {
    it('should import all core library modules', async () => {
      const applescript = await import('../../src/lib/applescript.js');
      const auth = await import('../../src/lib/auth.js');
      const parser = await import('../../src/lib/parser.js');
      const urlscheme = await import('../../src/lib/urlscheme.js');
      const validation = await import('../../src/lib/validation.js');
      
      expect(applescript.executeAppleScriptFile).toBeDefined();
      expect(auth.getAuthToken).toBeDefined();
      expect(parser.parseTodoList).toBeDefined();
      expect(urlscheme.executeThingsURL).toBeDefined();
      expect(validation.validateAppleScriptArg).toBeDefined();
    });
  });
});