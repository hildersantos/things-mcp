import { describe, it, expect } from '@jest/globals';
import { getTools } from '../../../src/tools/get.js';

describe('Get tools', () => {
  describe('Tool definitions', () => {
    it('should export correct get tools', () => {
      expect(getTools.length).toBeGreaterThan(0);
      
      const toolNames = getTools.map((t: any) => t.name);
      expect(toolNames).toContain('things_get_inbox');
      expect(toolNames).toContain('things_get_today');
      expect(toolNames).toContain('things_get_projects');
      expect(toolNames).toContain('things_get_areas');
      expect(toolNames).toContain('things_get_tags');
    });

    it('should have max_results parameter for list tools', () => {
      const inboxTool = getTools.find((t: any) => t.name === 'things_get_inbox');
      expect(inboxTool.inputSchema.properties.max_results).toBeDefined();
      expect(inboxTool.inputSchema.properties.max_results.type).toBe('number');
    });

    it('should require project_id for get_project', () => {
      const projectTool = getTools.find((t: any) => t.name === 'things_get_project');
      expect(projectTool.inputSchema.required).toContain('project_id');
    });

    it('should require area_id for get_area', () => {
      const areaTool = getTools.find((t: any) => t.name === 'things_get_area');
      expect(areaTool.inputSchema.required).toContain('area_id');
    });

    it('should have proper descriptions', () => {
      getTools.forEach(tool => {
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(10);
      });
    });
  });
});