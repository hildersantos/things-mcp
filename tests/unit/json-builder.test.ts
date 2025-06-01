import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ThingsJSONBuilder } from '../../src/lib/json-builder.js';
import * as urlscheme from '../../src/lib/urlscheme.js';

// Mock the urlscheme module
jest.mock('../../src/lib/urlscheme.js');

describe('ThingsJSONBuilder', () => {
  let builder: ThingsJSONBuilder;

  beforeEach(() => {
    builder = new ThingsJSONBuilder();
    mockExecuteThingsJSON.mockClear();
    mockExecuteThingsJSON.mockResolvedValue(undefined);
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
            tags: 'work,urgent',
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

    it('should create a project with headings', async () => {
      const params = {
        title: 'Project with Headings',
        headings: [
          { title: 'Planning', archived: false },
          { title: 'Execution', archived: false }
        ]
      };
      
      const result = await builder.createProject(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'project',
          attributes: { title: 'Project with Headings' }
        },
        {
          type: 'heading',
          attributes: { title: 'Planning', archived: false }
        },
        {
          type: 'heading',
          attributes: { title: 'Execution', archived: false }
        }
      ]);
      expect(result).toBe('✅ Project created successfully: "Project with Headings" (2 headings)');
    });

    it('should create a project with to-dos', async () => {
      const params = {
        title: 'Project with Todos',
        todos: ['Task 1', 'Task 2', 'Task 3']
      };
      
      const result = await builder.createProject(params);
      
      expect(mockExecuteThingsJSON).toHaveBeenCalledWith([
        {
          type: 'project',
          attributes: { title: 'Project with Todos' }
        },
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
      ]);
      expect(result).toBe('✅ Project created successfully: "Project with Todos" (3 to-dos)');
    });

    it('should create a project with headings and to-dos', async () => {
      const params = {
        title: 'Complex Project',
        headings: [{ title: 'Phase 1' }],
        todos: ['Task A', 'Task B'],
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
            tags: 'important,q1'
          }
        },
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
      ]);
      expect(result).toBe('✅ Project created successfully: "Complex Project" (1 headings, 2 to-dos)');
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
      
      const call = mockExecuteThingsJSON.mock.calls[0][0];
      const attributes = call[0].attributes as Record<string, unknown>;
      
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
      
      const call = mockExecuteThingsJSON.mock.calls[0][0];
      const attributes = call[0].attributes as Record<string, unknown>;
      
      expect(attributes.tags).toBe('tag1,tag2,tag3');
    });
  });
});