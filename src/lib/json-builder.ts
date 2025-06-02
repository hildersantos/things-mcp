import { AddTodoParams, AddProjectParams, ProjectItem, TodoItem } from '../types/things.js';
import { executeThingsJSON } from './urlscheme.js';

/**
 * Unified JSON builder for Things 3 items
 * Consolidates all creation logic into a single, maintainable pattern
 */
export class ThingsJSONBuilder {
  /**
   * Create a to-do item using JSON API
   */
  async createTodo(params: AddTodoParams): Promise<string> {
    const items = [this.buildTodoItem(params)];
    await executeThingsJSON(items);
    return `✅ To-do created successfully: "${params.title}"`;
  }

  /**
   * Create a project with optional to-dos and headings using JSON API
   */
  async createProject(params: AddProjectParams): Promise<string> {
    const items = this.buildProjectStructure(params);
    await executeThingsJSON(items);
    
    let itemCount = 0;
    if (params.items?.length) {
      itemCount = params.items.length;
    }
    
    return itemCount > 0
      ? `✅ Project created successfully: "${params.title}" (${itemCount} items)`
      : `✅ Project created successfully: "${params.title}"`;
  }

  /**
   * Build complete project structure including to-dos and headings
   */
  private buildProjectStructure(params: AddProjectParams): Record<string, unknown>[] {
    const projectItems: Record<string, unknown>[] = [];
    
    // Use hierarchical structure if provided
    if (params.items && params.items.length > 0) {
      projectItems.push(...this.buildHierarchicalItems(params.items));
    }
    
    // Create the project with nested items
    const projectAttributes = this.convertProjectParams(params);
    if (projectItems.length > 0) {
      projectAttributes.items = projectItems;
    }
    
    return [{
      type: 'project',
      attributes: projectAttributes
    }];
  }

  /**
   * Build hierarchical items (new structure)
   */
  private buildHierarchicalItems(items: ProjectItem[]): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = [];
    
    for (const item of items) {
      if (item.type === 'heading') {
        // Add the heading
        result.push({
          type: 'heading',
          attributes: {
            title: item.title,
            archived: item.archived || false
          }
        });
        
        // Add todos within this heading
        if (item.items && item.items.length > 0) {
          for (const todo of item.items) {
            result.push(this.buildFullTodo(todo));
          }
        }
      } else {
        // Standalone todo (not in a heading)
        result.push(this.buildFullTodo(item));
      }
    }
    
    return result;
  }

  /**
   * Build a full todo with all attributes
   */
  private buildFullTodo(todo: TodoItem): Record<string, unknown> {
    const attributes: Record<string, unknown> = {
      title: todo.title,
      ...(todo.notes && { notes: todo.notes }),
      ...(todo.when && { when: todo.when }),
      ...(todo.deadline && { deadline: todo.deadline }),
      ...(todo.tags && todo.tags.length > 0 && { tags: todo.tags }),
      ...(todo.completed !== undefined && { completed: todo.completed }),
      ...(todo.canceled !== undefined && { canceled: todo.canceled })
    };
    
    // Add checklist items if present
    if (todo.checklist && todo.checklist.length > 0) {
      attributes['checklist-items'] = todo.checklist.map(item => ({
        type: 'checklist-item',
        attributes: {
          title: item.title,
          ...(item.completed !== undefined && { completed: item.completed })
        }
      }));
    }
    
    return {
      type: 'to-do',
      attributes
    };
  }

  /**
   * Build a single to-do item
   */
  private buildTodoItem(params: AddTodoParams): Record<string, unknown> {
    return {
      type: 'to-do',
      attributes: this.convertTodoParams(params)
    };
  }


  /**
   * Convert to-do parameters to Things JSON format
   */
  private convertTodoParams(params: AddTodoParams): Record<string, unknown> {
    return {
      title: params.title,
      ...(params.notes && { notes: params.notes }),
      ...(params.when && { when: params.when }),
      ...(params.deadline && { deadline: params.deadline }),
      ...(params.tags && params.tags.length > 0 && { tags: params.tags }), // JSON expects array, not string
      ...(params.checklist_items && { 'checklist-items': params.checklist_items }),
      ...(params.list_id && { 'list-id': params.list_id }),
      ...(params.list && { list: params.list }),
      ...(params.heading && { heading: params.heading }),
      ...(params.completed !== undefined && { completed: params.completed }),
      ...(params.canceled !== undefined && { canceled: params.canceled })
    };
  }

  /**
   * Convert project parameters to Things JSON format
   */
  private convertProjectParams(params: AddProjectParams): Record<string, unknown> {
    return {
      title: params.title,
      ...(params.notes && { notes: params.notes }),
      ...(params.when && { when: params.when }),
      ...(params.deadline && { deadline: params.deadline }),
      ...(params.tags && params.tags.length > 0 && { tags: params.tags }), // JSON expects array, not string
      ...(params.area_id && { 'area-id': params.area_id }),
      ...(params.area && { area: params.area }),
      ...(params.completed !== undefined && { completed: params.completed }),
      ...(params.canceled !== undefined && { canceled: params.canceled })
    };
  }
}

// Export singleton instance
export const jsonBuilder = new ThingsJSONBuilder();