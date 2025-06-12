import { 
  AddTodoSchema, 
  ShowSchema
} from '../../src/types/mcp.js';

describe('AddTodoSchema', () => {
  test('should accept valid todo with all fields', () => {
    const validTodo = {
      title: 'Buy milk',
      notes: 'From the local store',
      when: 'today',
      deadline: '2025-06-15',
      tags: ['errands', 'shopping'],
      checklist_items: ['Check expiry date', 'Get receipt'],
      completed: false
    };
    
    const result = AddTodoSchema.safeParse(validTodo);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Buy milk');
      expect(result.data.tags).toEqual(['errands', 'shopping']);
    }
  });

  test('should accept minimal todo with just title', () => {
    const minimalTodo = {
      title: 'Simple task'
    };
    
    const result = AddTodoSchema.safeParse(minimalTodo);
    expect(result.success).toBe(true);
  });

  test('should reject empty title', () => {
    const invalidTodo = {
      title: '',
      when: 'today'
    };
    
    const result = AddTodoSchema.safeParse(invalidTodo);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title is required');
    }
  });

  test('should reject title that is too long', () => {
    const invalidTodo = {
      title: 'a'.repeat(256) // 256 caracteres
    };
    
    const result = AddTodoSchema.safeParse(invalidTodo);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title too long');
    }
  });

  test('should accept valid when values', () => {
    const validWhenValues = ['today', 'tomorrow', 'evening', 'anytime', 'someday'];
    
    validWhenValues.forEach(when => {
      const todo = { title: 'Test', when };
      const result = AddTodoSchema.safeParse(todo);
      expect(result.success).toBe(true);
    });
  });

  test('should accept valid date format for when', () => {
    const todo = {
      title: 'Test',
      when: '2025-06-15'
    };
    
    const result = AddTodoSchema.safeParse(todo);
    expect(result.success).toBe(true);
  });

  test('should reject invalid date format', () => {
    const todo = {
      title: 'Test',
      when: '15/06/2025' // formato inválido
    };
    
    const result = AddTodoSchema.safeParse(todo);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid date format. Use YYYY-MM-DD');
    }
  });

  test('should reject too many tags', () => {
    const todo = {
      title: 'Test',
      tags: Array(21).fill('tag') // 21 tags (máximo é 20)
    };
    
    const result = AddTodoSchema.safeParse(todo);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Too many tags');
    }
  });
});

describe('ShowSchema', () => {
  test('should accept valid id', () => {
    const validShow = { id: 'some-id' };
    const result = ShowSchema.safeParse(validShow);
    expect(result.success).toBe(true);
  });

  test('should accept valid query', () => {
    const validShow = { query: 'inbox' };
    const result = ShowSchema.safeParse(validShow);
    expect(result.success).toBe(true);
  });

  test('should reject when neither id nor query provided', () => {
    const invalidShow = { filter: ['tag1'] };
    const result = ShowSchema.safeParse(invalidShow);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Either id or query must be provided');
    }
  });
});

