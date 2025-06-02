import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Create the mock
const mockExecuteThingsJSON = jest.fn<() => Promise<void>>();

// Mock the urlscheme module
jest.unstable_mockModule('../../src/lib/urlscheme.js', () => ({
  executeThingsJSON: mockExecuteThingsJSON
}));

// Dynamic imports after mocking
const { ThingsJSONBuilder } = await import('../../src/lib/json-builder.js');

describe('ThingsJSONBuilder', () => {
  let builder: ThingsJSONBuilder;

  beforeEach(() => {
    builder = new ThingsJSONBuilder();
    jest.clearAllMocks();
  });

  describe('createTodo', () => {
    it('should create a simple to-do', async () => {
      const params = { title: 'Test Todo' };
      
      await builder.createTodo(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'to-do',
          attributes: { title: 'Test Todo' }
        }
      ]);
    });

    it('should create a to-do with all parameters', async () => {
      const params = {
        title: 'Complex Todo',
        notes: 'Some notes',
        when: 'today' as const,
        deadline: '2025-01-15',
        tags: ['work', 'urgent'],
        checklist_items: ['Step 1', 'Step 2'],
        list: 'inbox',
        completed: false
      };
      
      await builder.createTodo(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'to-do',
          attributes: {
            title: 'Complex Todo',
            notes: 'Some notes',
            when: 'today',
            deadline: '2025-01-15',
            tags: ['work', 'urgent'],
            'checklist-items': ['Step 1', 'Step 2'],
            list: 'inbox',
            completed: false
          }
        }
      ]);
    });
  });

  describe('createProject', () => {
    it('should create a simple project', async () => {
      const params = { title: 'Test Project' };
      
      const result = await builder.createProject(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'project',
          attributes: { title: 'Test Project' }
        }
      ]);
      expect(result).toBe('✅ Project created successfully: "Test Project"');
    });

    it('should create a project with items (headings)', async () => {
      const params = {
        title: 'Project with Headings',
        items: [
          { type: 'heading' as const, title: 'Planning', archived: false },
          { type: 'heading' as const, title: 'Execution', archived: false }
        ]
      };
      
      const result = await builder.createProject(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'project',
          attributes: {
            title: 'Project with Headings',
            items: [
              {
                type: 'heading',
                attributes: { title: 'Planning', archived: false }
              },
              {
                type: 'heading',
                attributes: { title: 'Execution', archived: false }
              }
            ]
          }
        }
      ]);
      expect(result).toBe('✅ Project created successfully: "Project with Headings" (2 items)');
    });

    it('should create a project with items (todos)', async () => {
      const params = {
        title: 'Project with Todos',
        items: [
          { type: 'todo' as const, title: 'Task 1' },
          { type: 'todo' as const, title: 'Task 2' },
          { type: 'todo' as const, title: 'Task 3' }
        ]
      };
      
      const result = await builder.createProject(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'project',
          attributes: {
            title: 'Project with Todos',
            items: [
              {
                type: 'to-do',
                attributes: { title: 'Task 1' }
              },
              {
                type: 'to-do',
                attributes: { title: 'Task 2' }
              },
              {
                type: 'to-do',
                attributes: { title: 'Task 3' }
              }
            ]
          }
        }
      ]);
      expect(result).toBe('✅ Project created successfully: "Project with Todos" (3 items)');
    });

    it('should create a project with mixed items (headings and todos)', async () => {
      const params = {
        title: 'Complex Project',
        items: [
          { type: 'heading' as const, title: 'Phase 1' },
          { type: 'todo' as const, title: 'Task A' },
          { type: 'todo' as const, title: 'Task B' }
        ],
        area: 'Work',
        tags: ['important', 'q1']
      };
      
      const result = await builder.createProject(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'project',
          attributes: {
            title: 'Complex Project',
            area: 'Work',
            tags: ['important', 'q1'],
            items: [
              {
                type: 'heading',
                attributes: { title: 'Phase 1', archived: false }
              },
              {
                type: 'to-do',
                attributes: { title: 'Task A' }
              },
              {
                type: 'to-do',
                attributes: { title: 'Task B' }
              }
            ]
          }
        }
      ]);
      expect(result).toBe('✅ Project created successfully: "Complex Project" (3 items)');
    });
  });

  describe('parameter conversion', () => {
    it('should omit undefined parameters', async () => {
      const params = {
        title: 'Test',
        notes: undefined,
        when: undefined,
        tags: []
      };
      
      await builder.createTodo(params);
      
      const call = mockExecuteThingsJSON.mock.calls[0]?.[0];
      const attributes = call?.[0]?.attributes as Record<string, unknown>;
      
      expect(attributes.notes).toBeUndefined();
      expect(attributes.when).toBeUndefined();
      expect(attributes.tags).toBeUndefined();
    });

    it('should convert tags array to comma-separated string', async () => {
      const params = {
        title: 'Test',
        tags: ['tag1', 'tag2', 'tag3']
      };
      
      await builder.createProject(params);
      
      const call = mockExecuteThingsJSON.mock.calls[0]?.[0];
      const attributes = call?.[0]?.attributes as Record<string, unknown>;
      
      expect(attributes.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });
});