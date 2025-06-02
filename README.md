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
Create a task "Buy milk" for today with tag "errands" in Things
```

### Create a Simple Project
```
Create a "Website Redesign" project in Things in my Work area
```

### Create a Complex Project
```
Plan a vacation to Japan in Things with research about destinations, booking flights and hotels, 
creating a packing list, and planning daily activities
```

### Another Project Example
```
Set up a new employee onboarding project in Things with IT setup tasks, HR paperwork, 
training schedule, and first week activities
```

### Update a To-Do
```
Mark task ABC-123 as completed in Things
```

### Add Items to Existing Project
```
Add new tasks to my "Website Redesign" project in Things: create wireframes, design mockups, and user testing
```

### List Tasks
```
Show me all tasks in my Things inbox
```

### View Projects
```
List all my projects in Things
```

### Navigate
```
Open my Today list in Things
```

### Get Task Details
```
Get full details for task TBeaUrcGH1zKoMmS7wwHVD from Things
```

### Search
```
Search for "meeting" in Things
```

### View Completed Tasks
```
Show me my completed tasks from the Things logbook
```

## Available Tools

### Creation Tools
- `things_add_todo` - Create a to-do with all options
- `things_add_project` - Create a project with sections (headings), todos, and hierarchical organization

### Update Tools (requires auth token)
- `things_update_todo` - Update an existing to-do using JSON API for full feature support
- `things_update_project` - Update an existing project using JSON API for full feature support
- `things_add_items_to_project` - Add structured todos and headings to an existing project

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