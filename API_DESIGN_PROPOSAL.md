# API Design Proposal: Hierarchical Project Structure

## Problem Statement

Current implementation creates flat structures where all todos appear after all headings, breaking the intended hierarchical organization. Additionally, todos lack attribute support (notes, deadlines, checklists).

## Proposed Solution

### 1. New Type Definitions

```typescript
// Base item interface
interface BaseItem {
  title: string;
  notes?: string;
}

// Checklist item for todos
interface ChecklistItem {
  title: string;
  completed?: boolean;
}

// Todo with full attribute support
interface TodoItem extends BaseItem {
  type: 'todo';
  when?: WhenLiteral | DateString | DateTimeString;
  deadline?: DateString;
  tags?: string[];
  completed?: boolean;
  canceled?: boolean;
  checklist?: ChecklistItem[];
}

// Heading that can contain todos
interface HeadingItem {
  type: 'heading';
  title: string;
  archived?: boolean;
  items?: TodoItem[]; // Todos nested within heading
}

// Project items can be todos or headings
type ProjectItem = TodoItem | HeadingItem;

// Updated project params
interface AddProjectParams {
  title: string;
  notes?: string;
  when?: WhenLiteral | DateString | DateTimeString;
  deadline?: DateString;
  tags?: string[];
  area_id?: string;
  area?: string;
  completed?: boolean;
  canceled?: boolean;
  
  // Deprecated (backward compatibility)
  todos?: string[];
  headings?: ThingsHeading[];
  
  // New hierarchical structure
  items?: ProjectItem[];
}
```

### 2. Usage Examples

#### Simple Project (Backward Compatible)
```javascript
things_add_project({
  title: "Simple Project",
  todos: ["Task 1", "Task 2"] // Still works
})
```

#### Hierarchical Project with Full Features
```javascript
things_add_project({
  title: "Q1 Product Launch",
  area: "Product",
  deadline: "2025-03-31",
  items: [
    {
      type: "heading",
      title: "Pre-Launch",
      items: [
        {
          type: "todo",
          title: "Finalize pricing",
          notes: "Research competitor pricing models",
          when: "today",
          tags: ["urgent", "product"],
          checklist: [
            { title: "Analyze tier 1 competitors" },
            { title: "Calculate profit margins" },
            { title: "Get CFO approval", completed: false }
          ]
        },
        {
          type: "todo",
          title: "Create marketing materials",
          deadline: "2025-02-15",
          notes: "Work with design team"
        }
      ]
    },
    {
      type: "heading",
      title: "Launch Day",
      items: [
        {
          type: "todo",
          title: "Deploy to production",
          when: "2025-03-01",
          checklist: [
            { title: "Run final tests" },
            { title: "Update DNS" },
            { title: "Monitor metrics" }
          ]
        }
      ]
    },
    {
      type: "todo",
      title: "Post-launch retrospective",
      notes: "Schedule for 2 weeks after launch",
      when: "2025-03-15"
    }
  ]
})
```

### 3. JSON Generation Logic

```typescript
class ThingsJSONBuilder {
  buildProjectStructure(params: AddProjectParams) {
    const projectItems = [];
    
    // Handle new hierarchical structure
    if (params.items) {
      projectItems.push(...this.buildHierarchicalItems(params.items));
    }
    
    // Backward compatibility
    else {
      if (params.headings) {
        projectItems.push(...this.buildHeadings(params.headings));
      }
      if (params.todos) {
        projectItems.push(...this.buildSimpleTodos(params.todos));
      }
    }
    
    return [{
      type: 'project',
      attributes: {
        ...this.convertProjectParams(params),
        items: projectItems.length > 0 ? projectItems : undefined
      }
    }];
  }
  
  buildHierarchicalItems(items: ProjectItem[]) {
    const result = [];
    
    for (const item of items) {
      if (item.type === 'heading') {
        // Add heading
        result.push({
          type: 'heading',
          attributes: {
            title: item.title,
            archived: item.archived || false
          }
        });
        
        // Add todos within this heading
        if (item.items) {
          result.push(...item.items.map(todo => 
            this.buildFullTodo(todo)
          ));
        }
      } else {
        // Standalone todo
        result.push(this.buildFullTodo(item));
      }
    }
    
    return result;
  }
  
  buildFullTodo(todo: TodoItem) {
    const attributes: any = {
      title: todo.title,
      ...(todo.notes && { notes: todo.notes }),
      ...(todo.when && { when: todo.when }),
      ...(todo.deadline && { deadline: todo.deadline }),
      ...(todo.tags && { tags: todo.tags }),
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
}
```

### 4. Benefits

1. **True Hierarchy**: Todos appear under their respective headings
2. **Full Attribute Support**: All Things features available
3. **Backward Compatible**: Old API still works
4. **Type Safe**: TypeScript ensures correct structure
5. **Intuitive**: Mirrors Things UI structure

### 5. Migration Path

1. Keep existing `todos` and `headings` arrays for compatibility
2. Detect and prefer `items` array when present
3. Document deprecation timeline
4. Provide migration examples

### 6. AppleScript Error Fix

The error is likely due to character encoding. Solution:
1. Add proper error handling in AppleScript
2. Escape special characters in output
3. Use consistent encoding (UTF-8)

```applescript
-- Add at beginning of script
set AppleScript's text item delimiters to ""

-- Escape special characters in output
on escapeText(someText)
    set AppleScript's text item delimiters to "|"
    set textItems to text items of someText
    set AppleScript's text item delimiters to "\\|"
    set escapedText to textItems as string
    set AppleScript's text item delimiters to ""
    return escapedText
end escapeText
```