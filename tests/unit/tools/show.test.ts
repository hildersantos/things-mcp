import { describe, it, expect } from '@jest/globals';
import { showTools } from '../../../src/tools/show.js';

describe('Show tools', () => {
  describe('Tool definitions', () => {
    it('should export correct show tools', () => {
      expect(showTools).toHaveLength(1);
      expect(showTools[0].name).toBe('things_show');
      expect(showTools[0].description).toContain('Navigate');
    });

    it('should have proper schema for things_show', () => {
      const showTool = showTools[0];
      expect(showTool.inputSchema.type).toBe('object');
      expect(showTool.inputSchema.properties.id).toBeDefined();
      expect(showTool.inputSchema.properties.query).toBeDefined();
      expect(showTool.inputSchema.properties.filter).toBeDefined();
    });

    it('should have proper property types', () => {
      const showTool = showTools[0];
      const props = showTool.inputSchema.properties;
      
      expect(props.id.type).toBe('string');
      expect(props.query.type).toBe('string');
      expect(props.filter.type).toBe('array');
      expect(props.filter.items.type).toBe('string');
    });

    it('should have proper descriptions', () => {
      const showTool = showTools[0];
      const props = showTool.inputSchema.properties;
      
      expect(props.id.description).toContain('ID');
      expect(props.query.description).toContain('list');
      expect(props.filter.description).toContain('Filter');
    });
  });
});