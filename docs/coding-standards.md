# Coding Standards

This document outlines the coding standards and conventions used in the JustTheChips project.

## Overview

The project uses modern TypeScript/JavaScript tooling to enforce consistent code quality and style:

- **ESLint**: For code quality and consistency
- **Prettier**: For code formatting
- **EditorConfig**: For editor configuration
- **Husky + lint-staged**: For pre-commit hooks

## Code Quality Rules

### ESLint Configuration

The project enforces the following key rules:

#### Import Organization
- **`import/order`**: Imports must be ordered alphabetically with newlines between groups
- External libraries first, then internal modules

Example:
```typescript
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { Calculator } from '@/pages/Calculator'
import { mathUtils } from '@/utils/math'
```

#### Strict Equality
- **`eqeqeq`**: Always use strict equality (`===` and `!==`) instead of loose equality
- This prevents type coercion bugs

```typescript
// ✅ Good
if (value === 'expected') { }
if (count !== 0) { }

// ❌ Bad
if (value == 'expected') { }
if (count != 0) { }
```

#### Promise Handling
- **`@typescript-eslint/no-floating-promises`**: All promises must be properly handled
- Either await them or explicitly handle errors

```typescript
// ✅ Good
await fetchData()
fetchData().catch(console.error)

// ❌ Bad
fetchData() // floating promise
```

#### Naming Conventions
- **`@typescript-eslint/naming-convention`**: Enforces consistent naming patterns

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `const userName = 'John'` |
| Functions | camelCase | `function calculateRPM() {}` |
| Classes | PascalCase | `class ToolCalculator {}` |
| Types/Interfaces | PascalCase | `interface Material {}` |
| Properties | camelCase, PascalCase, or snake_case | `material.cutting_speed` |

## Code Formatting

### Prettier Configuration

The project uses Prettier with these settings:

```json
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "es5"
}
```

- Single quotes for strings
- No semicolons
- Trailing commas in ES5-compatible places

### EditorConfig

The `.editorconfig` file ensures consistent editor settings:

- UTF-8 encoding
- LF line endings
- 2-space indentation
- Insert final newline
- Trim trailing whitespace

## Pre-commit Hooks

The project uses Husky and lint-staged to run checks before commits:

1. **Prettier**: Formats all staged files
2. **ESLint**: Lints and auto-fixes TypeScript/JavaScript files

This ensures code quality standards are maintained across all commits.

## Development Workflow

### Setting up the development environment

1. Install dependencies:
   ```bash
   npm install
   cd web && npm install --ignore-scripts
   ```

2. Run development server:
   ```bash
   cd web && npm run dev
   ```

### Before committing

The pre-commit hooks will automatically run, but you can manually check:

```bash
cd web
npm run lint        # Check for linting issues
npm run lint --fix  # Auto-fix linting issues
npm run build       # Ensure code builds successfully
```

### Continuous Integration

The CI pipeline runs on every PR and push to main:

1. **Linting**: Ensures code follows style guidelines
2. **Build**: Verifies the application builds successfully
3. **Tests**: Runs Playwright end-to-end tests

All checks must pass before code can be merged.

## TypeScript Guidelines

### Type Safety
- Use explicit types for function parameters and return values
- Avoid `any` type - use specific types or `unknown`
- Enable strict mode in TypeScript configuration

### Interface Design
- Use descriptive interface names
- Group related properties logically
- Document complex interfaces with JSDoc comments

Example:
```typescript
/**
 * Represents a cutting tool with its geometric and material properties
 */
interface Tool {
  id: string
  type: 'endmill_flat' | 'drill' | 'vbit' | 'facemill'
  diameter_mm: number
  flutes: number
  coating: string
  material: 'carbide' | 'HSS'
  stickout_mm: number
}
```

## File Organization

### Directory Structure
```
web/src/
├── core/               # Core business logic
│   ├── calculations/   # Math and engineering calculations
│   ├── data/          # Data schemas and loaders
│   └── utils/         # Utility functions
├── components/        # Reusable UI components
├── pages/            # Page components
├── store/            # State management
└── types/            # TypeScript type definitions
```

### File Naming
- Use kebab-case for file names: `speed-calculator.ts`
- Use PascalCase for React components: `SpeedCalculator.tsx`
- Use descriptive names that indicate the file's purpose

## Best Practices

### Performance
- Use appropriate React hooks (useMemo, useCallback) for optimization
- Minimize re-renders by proper state management
- Lazy load components when appropriate

### Error Handling
- Always handle errors in async operations
- Provide meaningful error messages
- Use proper error boundaries in React components

### Documentation
- Write clear JSDoc comments for public APIs
- Include examples in complex function documentation
- Keep README files up to date

### Testing
- Write unit tests for utility functions
- Test React components with React Testing Library
- Use Playwright for end-to-end testing

## IDE Configuration

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- EditorConfig for VS Code
- TypeScript Hero

### Settings
Configure your IDE to:
- Format on save using Prettier
- Show ESLint errors and warnings
- Use the project's TypeScript version
- Auto-organize imports

## Contributing

When contributing to the project:

1. Follow the established coding standards
2. Write tests for new functionality
3. Update documentation when adding features
4. Ensure all CI checks pass
5. Request code review from team members

The pre-commit hooks and CI pipeline help maintain code quality, but thoughtful code design and clear communication are equally important.