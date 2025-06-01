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
  when: z.union([WhenEnum, DateString, DateTimeString]).optional(),
  deadline: DateString.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  checklist_items: z
    .array(z.string().max(255))
    .max(100, 'Too many checklist items')
    .optional(),
  list_id: z.string().optional(),
  list: z.string().max(255).optional(),
  heading: z.string().max(255).optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
});

export const AddProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  notes: z.string().max(10000, 'Notes too long').optional(),
  when: z.union([WhenEnum, DateString, DateTimeString]).optional(),
  deadline: DateString.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
  area_id: z.string().optional(),
  area: z.string().max(255).optional(),
  todos: z.array(z.string().max(255)).max(100, 'Too many todos').optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
});

export const ShowSchema = z
  .object({
    id: z.string().optional(),
    query: z.string().max(255).optional(),
    filter: z.array(z.string()).optional(),
  })
  .refine((data) => data.id || data.query, {
    message: 'Either id or query must be provided',
  });

export const SearchSchema = z.object({
  query: z.string().max(255).optional(),
});

export const GetListSchema = z.object({
  list: z.enum([
    'inbox',
    'today',
    'upcoming',
    'anytime',
    'someday',
    'logbook',
    'trash',
  ]),
});

export const GetProjectSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
});

export const GetAreaSchema = z.object({
  area_id: z.string().min(1, 'Area ID is required'),
});
