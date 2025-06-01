/**
 * Core Things 3 types based on URL Scheme and AppleScript documentation
 */
export interface ThingsTodo {
  id: string;
  name: string;
  area?: string;
  tags: string[];
}

export interface ThingsProject {
  id: string;
  name: string;
  area?: string;
  tags: string[];
}

export interface ThingsArea {
  id: string;
  name: string;
}

export interface ThingsTag {
  id: string;
  name: string;
  parent?: string;
}

// Valid values for 'when' parameter
export type WhenLiteral =
  | 'today'
  | 'tomorrow'
  | 'evening'
  | 'anytime'
  | 'someday';
export type DateString = string; // YYYY-MM-DD format
export type DateTimeString = string; // YYYY-MM-DD@HH:MM format

// Parameters for creating a new task
export interface AddTodoParams {
  title: string;
  notes?: string;
  when?: WhenLiteral | DateString | DateTimeString;
  deadline?: DateString;
  tags?: string[];
  checklist_items?: string[];
  list_id?: string;
  list?: string;
  heading?: string;
  completed?: boolean;
  canceled?: boolean;
}

// Parameters for creating project
export interface AddProjectParams {
  title: string;
  notes?: string;
  when?: WhenLiteral | DateString | DateTimeString;
  deadline?: DateString;
  tags?: string[];
  area_id?: string;
  area?: string;
  todos?: string[];
  completed?: boolean;
  canceled?: boolean;
}

// Parameters for show command
export interface ShowParams {
  id?: string;
  query?: string;
  filter?: string[];
}

// Parameters for search command
export interface SearchParams {
  query?: string;
}

// Available lists in Things
export type ThingsList =
  | 'inbox'
  | 'today'
  | 'upcoming'
  | 'anytime'
  | 'someday'
  | 'logbook'
  | 'trash';
