import { describe, it, expect } from '@jest/globals';
import { parseTodoDetails } from '../../src/lib/parser.js';

describe('parseTodoDetails', () => {
  it('should parse complete todo details correctly', () => {
    const input = 'TBeaUrcGH1zKoMmS7wwHVD|Gerar invoice da Happily|Finanças|work,invoice|Monday, June 3, 2025 at 12:00:00 AM|Sunday, June 1, 2025 at 12:00:00 AM|open|Friday, May 30, 2025 at 10:00:00 AM||Work Project|Need to generate the monthly invoice for client';
    
    const result = parseTodoDetails(input);
    
    expect(result).toEqual({
      id: 'TBeaUrcGH1zKoMmS7wwHVD',
      name: 'Gerar invoice da Happily',
      area: 'Finanças',
      tags: ['work', 'invoice'],
      deadline: '2025-06-03',
      scheduledDate: '2025-06-01',
      notes: 'Need to generate the monthly invoice for client',
      status: 'open',
      creationDate: '2025-05-30',
      completionDate: undefined,
      project: 'Work Project'
    });
  });

  it('should parse todo with minimal information', () => {
    const input = 'ABC123|Simple Task|||||||||';
    
    const result = parseTodoDetails(input);
    
    expect(result).toEqual({
      id: 'ABC123',
      name: 'Simple Task',
      area: undefined,
      tags: [],
      deadline: undefined,
      scheduledDate: undefined,
      notes: undefined,
      status: 'open',
      creationDate: undefined,
      completionDate: undefined,
      project: undefined
    });
  });

  it('should parse completed todo with completion date', () => {
    const input = 'DEF456|Completed Task|Work|done|Monday, June 3, 2025 at 12:00:00 AM||completed|Friday, May 30, 2025 at 10:00:00 AM|Saturday, June 1, 2025 at 3:00:00 PM||Task completed successfully';
    
    const result = parseTodoDetails(input);
    
    expect(result.status).toBe('completed');
    expect(result.completionDate).toBe('2025-06-01');
  });

  it('should handle empty output', () => {
    expect(() => parseTodoDetails('')).toThrow('Empty output for todo details');
  });

  it('should handle malformed input', () => {
    const input = 'ABC123|Task Name|Area'; // Too few parts
    
    // Should not throw in non-strict mode, but should warn
    const result = parseTodoDetails(input);
    
    expect(result.id).toBe('ABC123');
    expect(result.name).toBe('Task Name');
  });

  it('should throw on missing required fields', () => {
    const input = '|Missing Name|Area|tags|||||||||'; // Missing name
    
    expect(() => parseTodoDetails(input)).toThrow(
      'Missing required fields (id/name) in todo details'
    );
  });

  it('should handle date parsing failures gracefully', () => {
    const input = 'ABC123|Task|Area||invalid-date|another-invalid||||||';
    
    const result = parseTodoDetails(input);
    
    // Should return original date strings if parsing fails
    expect(result.deadline).toBe('invalid-date');
    expect(result.scheduledDate).toBe('another-invalid');
  });
});