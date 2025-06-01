# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based MCP (Model Context Protocol) server for integrating with Things 3, a task management application. The project uses ES modules and strict TypeScript configuration.

## Development Commands

### Build and Run
- `npm run build` - Compile TypeScript to JavaScript (output to `dist/`)
- `npm run dev` - Run TypeScript compiler in watch mode for development
- `npm start` - Run the compiled server from `dist/index.js`

### Code Quality
- `npm run lint` - Run ESLint on all TypeScript files in `src/`
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run Jest in watch mode

## Architecture

### Technology Stack
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Language**: TypeScript with strict mode enabled
- **MCP SDK**: `@modelcontextprotocol/sdk` for MCP server implementation
- **Validation**: Zod for schema validation
- **Testing**: Jest

### Project Structure
- `src/` - TypeScript source files (entry point will be `src/index.ts`)
- `dist/` - Compiled JavaScript output
- TypeScript targets ES2022 with Node16 module resolution

### TypeScript Configuration
The project uses strict TypeScript settings including:
- All strict checks enabled
- No unused locals/parameters allowed
- No implicit returns
- Consistent casing enforced

## MCP Server Context

This server is designed to provide secure integration between MCP-compatible tools and the Things 3 task management application. When implementing features, consider:
- Security implications of task data access
- MCP protocol compliance
- Proper error handling and validation using Zod schemas

## Testing Strategy

This project follows a pragmatic TDD (Test-Driven Development) approach:

### Testing Principles
1. **Write tests first** - Define expected behavior before implementation
2. **Avoid duplication** - Don't re-test Zod validations in integration tests (already covered in unit tests)
3. **Focus on behavior** - Test contracts and important edge cases, not implementation details
4. **Well-organized tests** - Separate unit from integration tests, use clear describe/it blocks
5. **Smart coverage** - Test critical paths and error cases, don't aim for 100% coverage

### What to Test
- **Unit tests**: Core logic, error handling, data transformations
- **Integration tests**: Tool orchestration, MCP protocol compliance, end-to-end flows
- **Mock appropriately**: Mock external dependencies (AppleScript execution, file system)

### What NOT to Test
- Zod schema validations in integration tests (trust unit tests)
- Trivial getters/setters or boilerplate code
- Every parameter combination (trust Zod validation)
- Implementation details that might change

### Example Approach
- `urlscheme.ts`: Test URL construction and auth handling, but not parameter validation
- `applescript.ts`: Test secure execution and parsing, mock actual execution
- Tool handlers: Test orchestration and responses, trust already-tested libraries