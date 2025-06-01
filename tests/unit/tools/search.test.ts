import { describe, it, expect } from '@jest/globals';
import { searchTools } from '../../../src/tools/search.js';

describe('Search tools', () => {
  describe('Tool definitions', () => {
    it('should export correct search tools', () => {
      expect(searchTools).toHaveLength(1);
      expect(searchTools[0].name).toBe('things_search');
      expect(searchTools[0].description).toContain('Search');
    });

    it('should have proper schema for things_search', () => {
      const searchTool = searchTools[0];
      expect(searchTool.inputSchema.type).toBe('object');
      expect(searchTool.inputSchema.properties.query).toBeDefined();
      expect(searchTool.inputSchema.properties.query.type).toBe('string');
    });

    it('should have proper description for query parameter', () => {
      const searchTool = searchTools[0];
      expect(searchTool.inputSchema.properties.query.description).toContain('leave empty');
    });
  });
});