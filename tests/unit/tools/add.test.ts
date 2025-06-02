import { describe, it, expect } from '@jest/globals';
import { addTools } from '../../../src/tools/add.js';

describe('Add tools', () => {
  describe('Tool definitions', () => {
    it('should export correct add tools', () => {
      expect(addTools).toHaveLength(2);
      expect(addTools[0].name).toBe('things_add_todo');
      expect(addTools[1].name).toBe('things_add_project');
    });

    it('should have proper schemas for add_todo', () => {
      const todoTool = addTools[0];
      expect(todoTool.description).toContain('to-do');
      expect(todoTool.inputSchema.type).toBe('object');
      expect(todoTool.inputSchema.properties.title).toBeDefined();
      expect(todoTool.inputSchema.required).toContain('title');
    });

    it('should have proper schemas for add_project', () => {
      const projectTool = addTools[1];
      expect(projectTool.description).toContain('project');
      expect(projectTool.inputSchema.type).toBe('object');
      expect(projectTool.inputSchema.properties.title).toBeDefined();
      expect(projectTool.inputSchema.required).toContain('title');
    });

    it('should have all expected properties for add_todo', () => {
      const todoTool = addTools[0];
      const props = todoTool.inputSchema.properties;
      
      expect(props.title).toBeDefined();
      expect(props.notes).toBeDefined();
      expect(props.when).toBeDefined();
      expect(props.deadline).toBeDefined();
      expect(props.tags).toBeDefined();
      expect(props.checklist_items).toBeDefined();
      expect(props.list_id).toBeDefined();
      expect(props.list).toBeDefined();
      expect(props.heading).toBeDefined();
      expect(props.completed).toBeDefined();
      expect(props.canceled).toBeDefined();
    });

    it('should have all expected properties for add_project', () => {
      const projectTool = addTools[1];
      const props = projectTool.inputSchema.properties;
      
      expect(props.title).toBeDefined();
      expect(props.notes).toBeDefined();
      expect(props.when).toBeDefined();
      expect(props.deadline).toBeDefined();
      expect(props.tags).toBeDefined();
      expect(props.area_id).toBeDefined();
      expect(props.area).toBeDefined();
      expect(props.items).toBeDefined();
      expect(props.completed).toBeDefined();
      expect(props.canceled).toBeDefined();
    });
  });
});