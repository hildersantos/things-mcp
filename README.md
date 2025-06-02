# Things MCP

A Model Context Protocol (MCP) server for Things 3 integration. Enables Claude Desktop and Claude Code to interact with Things 3 on macOS.

## Features

- Create to-dos and projects with full metadata
- Update existing to-dos and projects
- List items from any Things list (Inbox, Today, Logbook, Trash, etc.)
- Retrieve all projects, areas, and tags
- Navigate to specific items or lists
- Search within Things
- Secure AppleScript execution
- Comprehensive error handling

## Requirements

- macOS with Things 3 installed
- Node.js 18 or later
- Things URL scheme enabled (automatic on first use)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/things-mcp.git
   cd things-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

1. **Get your Things auth token** (for update operations):
   - Open Things → Settings → General
   - Enable Things URLs
   - Click Manage → Copy Token

2. **Add to your Claude MCP settings**:
   ```json
   {
     "things-mcp": {
       "command": "node",
       "args": ["/absolute/path/to/things-mcp/dist/index.js"],
       "env": {
         "THINGS_AUTH_TOKEN": "your-token-here"
       }
     }
   }
   ```

   Replace `/absolute/path/to/things-mcp` with the actual path to your installation.

## Usage Examples

### Create a To-Do
```
Use things_add_todo to create a task called "Buy milk" for today with tag "errands"
```

### Create a Project
```
Use things_add_project to create a project "Website Redesign" in area "Work" with tasks "Design mockups" and "Implement frontend"
```

### Create a Hierarchical Project
```
Use things_add_project with hierarchical structure:
{
  "title": "Website Redesign",
  "area": "Work",
  "items": [
    {
      "type": "heading",
      "title": "Research Phase",
      "items": [
        {
          "type": "todo",
          "title": "Analyze competitors",
          "notes": "Focus on UX patterns",
          "when": "today"
        },
        {
          "type": "todo",
          "title": "User surveys",
          "deadline": "2025-01-20",
          "checklist": [
            { "title": "Create questions" },
            { "title": "Send to users" },
            { "title": "Analyze results" }
          ]
        }
      ]
    },
    {
      "type": "todo",
      "title": "Get stakeholder approval",
      "notes": "Final step"
    }
  ]
}
```

### Update a To-Do
```
Use things_update_todo to mark task ABC-123 as completed
```

### List Tasks
```
Show me all tasks in my Things inbox using things_get_inbox
```

### Get Projects with IDs
```
List all my projects using things_get_projects (this will show IDs you can use)
```

### Navigate
```
Use things_show to open my Today list
```

### Get Detailed Task Information
```
Use things_get_todo_details with id "TBeaUrcGH1zKoMmS7wwHVD" to get full details including deadline, notes, status
```

## Available Tools

### Creation Tools
- `things_add_todo` - Create a to-do with all options
- `things_add_project` - Create a project with to-dos and headings

### Update Tools (requires auth token)
- `things_update_todo` - Update an existing to-do
- `things_update_project` - Update an existing project

### Reading Tools
- `things_get_inbox` - List inbox items
- `things_get_today` - List today's items
- `things_get_upcoming` - List scheduled items
- `things_get_anytime` - List anytime items
- `things_get_someday` - List someday items
- `things_get_logbook` - List completed items
- `things_get_trash` - List trashed items
- `things_get_projects` - List all active projects
- `things_get_areas` - List all areas
- `things_get_tags` - List all tags
- `things_get_project` - List items in a specific project (requires project_id)
- `things_get_area` - List items in a specific area (requires area_id)
- `things_get_list` - Get items from a specific list by name
- `things_get_todo_details` - Get detailed information about a specific to-do

All list tools support an optional `max_results` parameter to limit output.

### Navigation Tools
- `things_show` - Navigate to item or list
- `things_search` - Open search with optional query

## Development

```bash
# Development mode with watch
npm run dev

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Troubleshooting

### "Things 3 does not appear to be running"
Make sure Things 3 is installed and has been opened at least once.

### "Authentication failed"
Check that your THINGS_AUTH_TOKEN is correctly set in the MCP configuration.

### AppleScript Permissions
On first run, macOS may ask for permission to control Things. Grant this permission for the MCP to work.

### Performance Issues
Use the `max_results` parameter when listing large collections:
```
Use things_get_projects with max_results 10
```

## License

MIT

## Credits

Built with the [Model Context Protocol SDK](https://github.com/anthropics/mcp).
Things is a trademark of Cultured Code GmbH & Co. KG.