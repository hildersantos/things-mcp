# Things MCP

A secure and robust MCP (Model Context Protocol) server for Things 3 integration. Enables Claude Desktop and Claude Code to interact with Things 3 on macOS.

## Features

- ✅ Create to-dos and projects with full metadata
- ✅ Update existing to-dos and projects
- ✅ List items from any Things list (Inbox, Today, Logbook, Trash, etc.)
- ✅ Retrieve all projects, areas, and tags
- ✅ Navigate to specific items or lists
- ✅ Search within Things
- 🔒 Secure AppleScript execution
- 🚀 Optimized performance with configurable limits
- 🛡️ Comprehensive error handling

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

### Create a Project with Headings (Legacy)
```
Use things_add_project to create a project "Vacation Planning" with headings "Travel" and "Accommodation" and tasks "Book flights" and "Find hotel"
```

### Create a Hierarchical Project (New!)
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

### Get List by Name
```
Use things_get_list with list "logbook" to see completed tasks
```

### Get Detailed Task Information
```
Use things_get_todo_details with id "TBeaUrcGH1zKoMmS7wwHVD" to get full details including deadline, notes, status
```

## Available Tools

### Creation Tools (URL Scheme & JSON)
- `things_add_todo` - Create a to-do with all options
- `things_add_project` - Create a project with to-dos and headings (supports JSON format for headings)

### Update Tools (URL Scheme - requires auth token)
- `things_update_todo` - Update an existing to-do
- `things_update_project` - Update an existing project

### Reading Tools (AppleScript)
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
- `things_get_todo_details` - Get detailed information about a specific to-do including deadline, notes, status, etc.

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

## Testing

This project includes comprehensive test coverage:

- **Unit Tests**: Core logic, parsers, validation, error handling
- **Integration Tests**: Tool orchestration, MCP protocol compliance
- **Mocked Dependencies**: AppleScript execution, file system operations

Run tests with:
```bash
npm test
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

## Architecture

### Core Components

- **AbstractToolHandler**: Base class that eliminates code duplication across tool handlers
- **ToolRegistry**: Centralized system for automatic tool discovery and registration
- **Schema Utils**: Converts Zod schemas to JSON Schema format required by MCP
- **URL Scheme Integration**: Secure parameter encoding for Things URL scheme
- **AppleScript Execution**: Safe execution of AppleScript files with validation
- **Error Handling**: Comprehensive error types with structured responses

### Security Features

- All AppleScript arguments are validated and sanitized
- No string interpolation in AppleScript execution
- Auth tokens are never logged
- Input validation on all parameters
- Secure error messages that don't expose internals

## Internationalization

This MCP uses English list names ("Inbox", "Today", etc.) which Things handles correctly on most systems. If you experience issues with non-English systems:

1. Ensure Things is set to English, or
2. Wait for a future update that uses list IDs

Custom projects and areas work with any language as we reference them by ID.

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`npm test`)
- Code is properly formatted (`npm run format`)
- Security considerations are addressed
- Documentation is updated

## Recent Updates

- ✅ Refactored codebase using AbstractToolHandler pattern
- ✅ Implemented ToolRegistry for automatic tool discovery
- ✅ Added comprehensive error handling with structured responses
- ✅ Added support for Logbook and Trash lists
- ✅ Implemented update operations for to-dos and projects
- ✅ Added schema validation with Zod to JSON Schema conversion
- ✅ Eliminated ~200 lines of duplicate code
- ✅ Improved type safety throughout the codebase

## License

MIT

## Credits

Built with the [Model Context Protocol SDK](https://github.com/anthropics/mcp).
Things is a trademark of Cultured Code GmbH & Co. KG.