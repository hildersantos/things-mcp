import { describe, it, expect } from '@jest/globals';
import {
  parseTodoList,
  parseProjectList,
  parseAreaList,
  parseTagList
} from '../../src/lib/parser.js';

describe('parseTodoList', () => {
  it('should parse valid todo lines', () => {
    const input = `ABC-123|Task 1|Work|urgent,high
DEF-456|Task 2||low
GHI-789|Task 3|Personal|`;
    
    const result = parseTodoList(input);
    
    expect(result).toEqual([
      { id: 'ABC-123', name: 'Task 1', area: 'Work', tags: ['urgent', 'high'] },
      { id: 'DEF-456', name: 'Task 2', area: undefined, tags: ['low'] },
      { id: 'GHI-789', name: 'Task 3', area: 'Personal', tags: [] }
    ]);
  });

  it('should handle empty input', () => {
    expect(parseTodoList('')).toEqual([]);
    expect(parseTodoList('\n\n')).toEqual([]);
  });

  it('should skip malformed lines in non-strict mode', () => {
    const input = `ABC-123|Task 1|Work|urgent
INVALID_LINE
DEF-456|Task 2||
|Missing ID||
ABC-789||Work|`;
    
    const result = parseTodoList(input);
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Task 1');
    expect(result[1].name).toBe('Task 2');
  });

  it('should throw on malformed lines in strict mode', () => {
    const input = 'INVALID|LINE';
    
    expect(() => parseTodoList(input, { strict: true }))
      .toThrow('Line 1 has invalid format');
  });

  it('should trim whitespace', () => {
    const input = '  ABC-123  |  Task Name  |  Area Name  |  tag1 , tag2  ';
    
    const result = parseTodoList(input);
    
    expect(result[0]).toEqual({
      id: 'ABC-123',
      name: 'Task Name',
      area: 'Area Name',
      tags: ['tag1', 'tag2']
    });
  });

  it('should handle empty tags correctly', () => {
    const input = 'ABC-123|Task|Area|,,  ,';
    
    const result = parseTodoList(input);
    
    expect(result[0].tags).toEqual([]);
  });

  it('should use custom logger', () => {
    const warnings: string[] = [];
    const logger = (msg: string) => warnings.push(msg);
    
    parseTodoList('INVALID', { logger });
    
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('invalid format');
  });
});

describe('parseProjectList', () => {
  it('should parse projects same as todos', () => {
    const input = 'PRJ-123|Project Name|Work|planning,2024';
    
    const result = parseProjectList(input);
    
    expect(result).toEqual([{
      id: 'PRJ-123',
      name: 'Project Name',
      area: 'Work',
      tags: ['planning', '2024']
    }]);
  });
});

describe('parseAreaList', () => {
  it('should parse area lines', () => {
    const input = `AREA-1|Work
AREA-2|Personal
AREA-3|Side Projects`;
    
    const result = parseAreaList(input);
    
    expect(result).toEqual([
      { id: 'AREA-1', name: 'Work' },
      { id: 'AREA-2', name: 'Personal' },
      { id: 'AREA-3', name: 'Side Projects' }
    ]);
  });

  it('should skip invalid area lines', () => {
    const input = `AREA-1|Work
InvalidLine
AREA-2|
|Missing ID`;
    
    const result = parseAreaList(input);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Work');
  });
});

describe('parseTagList', () => {
  it('should parse tags without parents', () => {
    const input = `TAG-1|urgent|
TAG-2|work|
TAG-3|personal|`;
    
    const result = parseTagList(input);
    
    expect(result).toEqual([
      { id: 'TAG-1', name: 'urgent', parent: undefined },
      { id: 'TAG-2', name: 'work', parent: undefined },
      { id: 'TAG-3', name: 'personal', parent: undefined }
    ]);
  });

  it('should parse tags with parents', () => {
    const input = `TAG-1|urgent|
TAG-2|high|urgent
TAG-3|low|urgent`;
    
    const result = parseTagList(input);
    
    expect(result).toEqual([
      { id: 'TAG-1', name: 'urgent', parent: undefined },
      { id: 'TAG-2', name: 'high', parent: 'urgent' },
      { id: 'TAG-3', name: 'low', parent: 'urgent' }
    ]);
  });

  it('should handle edge cases', () => {
    const input = `TAG-1|name|parent
TAG-2|name||
TAG-3|name|  `;
    
    const result = parseTagList(input);
    
    expect(result[0].parent).toBe('parent');
    expect(result[1].parent).toBeUndefined();
    expect(result[2].parent).toBeUndefined();
  });
});