import { AddTodoParams, AddProjectParams, ProjectItem, TodoItem, UpdateTodoJSONParams, UpdateProjectJSONParams, AddItemsToProjectParams } from '../types/things.js';
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
   * Update an existing to-do using JSON API
   */
  async updateTodo(params: UpdateTodoJSONParams): Promise<string> {
    const updateData = {
      type: 'to-do',
      operation: 'update',
      id: params.id,
      attributes: this.convertTodoParams(params)
    };
    
    await executeThingsJSON([updateData]);
    return `✅ To-do updated successfully: "${params.title || 'Updated todo'}"`;
  }

  /**
   * Update an existing project using JSON API
   */
  async updateProject(params: UpdateProjectJSONParams): Promise<string> {
    const updateData = {
      type: 'project',
      operation: 'update',
      id: params.id,
      attributes: this.convertProjectParams(params)
    };
    
    await executeThingsJSON([updateData]);
    return `✅ Project updated successfully: "${params.title || 'Updated project'}"`;
  }

  /**
   * Add items to an existing project using JSON API
   */
  async addItemsToProject(params: AddItemsToProjectParams): Promise<string> {
    const projectItems = this.buildProjectItems(params.items);
    
    const updateData = {
      type: 'project',
      operation: 'update',
      id: params.id,
      attributes: {
        items: projectItems
      }
    };
    
    await executeThingsJSON([updateData]);
    return `✅ Added ${params.items.length} items to project successfully`;
  }

  /**
   * Build complete project structure including to-dos and headings
   */
  private buildProjectStructure(params: AddProjectParams): Record<string, unknown>[] {
    const projectItems: Record<string, unknown>[] = [];
    
    // Build flat structure of items
    if (params.items && params.items.length > 0) {
      projectItems.push(...this.buildProjectItems(params.items));
    }
    
    // Create the project with items
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
   * Build flat array of project items (headings and todos as siblings)
   */
  private buildProjectItems(items: ProjectItem[]): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = [];
    
    for (const item of items) {
      if (item.type === 'heading') {
        // Add the heading as a simple item
        result.push({
          type: 'heading',
          attributes: {
            title: item.title,
            archived: item.archived || false
          }
        });
      } else {
        // Add todo
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
      ...(params.checklist_items && params.checklist_items.length > 0 && { 
        'checklist-items': params.checklist_items.map(item => ({
          type: 'checklist-item',
          attributes: {
            title: item,
            completed: false
          }
        }))
      }),
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