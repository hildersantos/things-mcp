import { z } from 'zod';

/**
 * Zod schemas for MCP parameter validation
 */

// Custom validators
const WhenEnum = z.enum(['today', 'tomorrow', 'evening', 'anytime', 'someday']);
const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD');
const DateTimeString = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}@\d{2}:\d{2}$/,
    'Invalid datetime format. Use YYYY-MM-DD@HH:MM'
  );

export const AddTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  notes: z.string().max(10000, 'Notes too long').optional(),
  when: z.union([WhenEnum, DateString, DateTimeString]).optional().describe('Schedule the todo: today/tomorrow/evening (relative), anytime/someday (Things categories), YYYY-MM-DD (specific date), or YYYY-MM-DD@HH:MM (specific time)'),
  deadline: DateString.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  checklist_items: z
    .array(z.string().max(255))
    .max(100, 'Too many checklist items')
    .optional()
    .describe('Break down this todo into smaller, manageable steps using a checklist. Perfect for complex tasks that have multiple components but don\'t warrant a full project. Each checklist item can be individually checked off, providing visual progress feedback. Use when user mentions "steps", "checklist", "break down into parts", or when a task has multiple actionable components (e.g., "Plan event" → ["Book venue", "Arrange catering", "Send invites"]). Alternative to creating separate todos for multi-step tasks.'),
  list_id: z.string().optional().describe('ID of the project or area to add the todo to'),
  list: z.string().max(255).optional().describe('Name of the project, area, or built-in list (inbox, today, anytime, etc.)'),
  heading: z.string().max(255).optional().describe('Place this todo under a specific heading within the project'),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
});

const ChecklistItemSchema = z.object({
  title: z.string().min(1, 'Checklist item title is required').max(255, 'Title too long'),
  completed: z.boolean().optional().default(false),
});

const TodoItemSchema = z.object({
  type: z.literal('todo').describe('Creates an individual task/activity in the project. Todos that appear after a heading in the items array will be visually grouped under that heading in Things 3. Use for specific activities, locations to visit, meals to have, etc.'),
  title: z.string().min(1, 'Todo title is required').max(255, 'Title too long'),
  notes: z.string().max(10000, 'Notes too long').optional(),
  when: z.union([WhenEnum, DateString, DateTimeString]).optional().describe('Schedule the todo: today/tomorrow/evening (relative), anytime/someday (Things categories), YYYY-MM-DD (specific date), or YYYY-MM-DD@HH:MM (specific time)'),
  deadline: DateString.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
  checklist: z.array(ChecklistItemSchema).max(100, 'Too many checklist items').optional().describe('Break down this todo into smaller, manageable steps using a structured checklist. Each item can be individually checked off and tracked. Perfect for complex tasks within projects that have multiple components. Use when user mentions "steps", "checklist", "break down into parts", or when a task has multiple actionable components. Provides detailed progress tracking within project todos.'),
});

const HeadingItemSchema = z.object({
  type: z.literal('heading').describe('Creates a section header/divider in the project. Use this when user wants to \'separate by days\', \'organize by categories\', or create \'sections\'. Headings are visual separators - todos that appear after a heading in the items array will be visually grouped under it in Things 3.'),
  title: z.string().min(1, 'Heading title is required').max(255, 'Title too long'),
  archived: z.boolean().optional().default(false),
});

const ProjectItemSchema = z.discriminatedUnion('type', [TodoItemSchema, HeadingItemSchema]);

export const AddProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  notes: z.string().max(10000, 'Notes too long').optional(),
  when: z.union([WhenEnum, DateString, DateTimeString]).optional().describe('Schedule the todo: today/tomorrow/evening (relative), anytime/someday (Things categories), YYYY-MM-DD (specific date), or YYYY-MM-DD@HH:MM (specific time)'),
  deadline: DateString.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  area_id: z.string().optional().describe('ID of the area to place the project in'),
  area: z.string().max(255).optional().describe('Name of the area to place the project in'),
  items: z.array(ProjectItemSchema).max(200, 'Too many items').optional().describe('Create a structured project with sections (headings) and todos in a flat array. Each item must have a \'type\' field: \'heading\' for section dividers, \'todo\' for tasks. Items are siblings - todos after a heading are visually grouped under it. Example: [{type: \'heading\', title: \'Day 1\'}, {type: \'todo\', title: \'Morning walk\'}, {type: \'todo\', title: \'Breakfast\'}, {type: \'heading\', title: \'Day 2\'}, {type: \'todo\', title: \'Museum visit\'}]. Order matters - todos appear under the most recent heading.'),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
});

export const ShowSchema = z
  .object({
    id: z.string().optional().describe('ID of a specific to-do, project, or area'),
    query: z.string().max(255).optional().describe('Navigate to a list: inbox, today, anytime, upcoming, someday, logbook, trash'),
    filter: z.array(z.string()).optional().describe('Filter by tags when showing a list'),
  })
  .refine((data) => data.id || data.query, {
    message: 'Either id or query must be provided',
  });


export const GetListByNameSchema = z.object({
  list: z.enum([
    'inbox',
    'today',
    'upcoming',
    'anytime',
    'someday',
    'logbook',
    'trash',
  ]),
  max_results: z.number().optional().describe('Limit number of results returned (defaults to all if not specified)'),
});

export const GetProjectSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  max_results: z.number().optional().describe('Limit number of results returned (defaults to all if not specified)'),
});

export const GetAreaSchema = z.object({
  area_id: z.string().min(1, 'Area ID is required'),
  max_results: z.number().optional().describe('Limit number of results returned (defaults to all if not specified)'),
});

export const GetListSchema = z.object({
  max_results: z.number().optional().describe('Limit number of results returned (defaults to all if not specified)'),
});


export const GetTodoDetailsSchema = z.object({
  id: z.string().min(1, 'Todo ID is required').describe('ID of the to-do to get detailed information for'),
});

// New unified JSON update schemas
export const UpdateTodoJSONSchema = AddTodoSchema.extend({
  id: z.string().min(1, 'Todo ID is required').describe('Unique system-generated ID of the todo to update (not the title). Use things_get_project, things_get_list, or things_search to find the correct ID first, if you don\'t have it.'),
  operation: z.literal('update').default('update')
});

export const UpdateProjectJSONSchema = AddProjectSchema.extend({
  id: z.string().min(1, 'Project ID is required').describe('Unique system-generated ID of the project to update (not the title). Use things_get_projects or things_search to find the correct ID first, if you don\'t have it.'),
  operation: z.literal('update').default('update')
});

export const AddItemsToProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  items: z.array(ProjectItemSchema).min(1, 'At least one item required').max(200, 'Too many items').describe('Add structured todos and headings to an existing project. Items are added as a flat array where headings act as visual separators. Todos that follow a heading will appear grouped under it. Example: [{type: \'heading\', title: \'Phase 2\'}, {type: \'todo\', title: \'Task 1\'}, {type: \'todo\', title: \'Task 2\'}].'),
  operation: z.literal('update').default('update')
});
