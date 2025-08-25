# Contributing to JustTheChips

Thank you for your interest in contributing to JustTheChips! This guide will help you get started with the development process.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern web browser
- Basic familiarity with TypeScript and React

### Initial Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/JustTheChips.git
   cd JustTheChips
   ```

2. **Install dependencies**:
   ```bash
   npm install                    # Root dependencies
   cd web && npm install --ignore-scripts  # Web app dependencies (ignore husky errors)
   ```

3. **Verify setup**:
   ```bash
   cd web
   npm run lint                   # Should pass without errors
   npm run build                  # Should build successfully
   npm run dev                    # Start development server
   ```

4. **Open http://localhost:5174** to verify the app loads correctly

## Development Workflow

### Before Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Review relevant documentation**:
   - [Technical Specification](docs/initial-spec.md) for requirements
   - [Architecture Guide](docs/initial-architecture.md) for system design
   - [Coding Standards](docs/coding-standards.md) for code style
   - [Testing Guidelines](docs/testing-guidelines.md) for testing practices

### During Development

1. **Follow the coding standards**:
   ```bash
   cd web
   npm run lint                   # Check for issues
   npm run lint -- --fix         # Auto-fix style issues
   ```

2. **Write tests for new functionality**:
   ```bash
   npm run test                   # Run unit tests
   npm run test:coverage          # Check coverage
   ```

3. **Test your changes**:
   ```bash
   npm run build                  # Ensure it builds
   npm run dev                    # Manual testing
   npx playwright test            # E2E tests (from project root)
   ```

4. **Commit frequently** with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add new material validation logic"
   ```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that automatically:
- Run Prettier to format code
- Run ESLint to check code quality
- Ensure consistent code style

If hooks fail, fix the issues before committing.

## Code Standards

### TypeScript Guidelines

- **Strict typing**: Use proper TypeScript types, avoid `any`
- **Interfaces**: Define clear interfaces for data structures
- **Pure functions**: Prefer pure functions for calculations
- **Error handling**: Handle errors gracefully with proper types

### Code Organization

```
web/src/
├── core/
│   ├── data/           # JSON data files and schemas
│   ├── calculations/   # Pure calculation functions
│   └── utils/          # Shared utilities
├── components/         # Reusable UI components
├── pages/              # Page-level components
└── App.tsx            # Main app component
```

### Naming Conventions

- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components
- **Functions**: `camelCase` 
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Import Order

ESLint enforces import ordering:
1. External libraries (React, etc.)
2. Internal modules (../utils, etc.)
3. Relative imports (./component)

## Testing Requirements

### Unit Tests

- **Coverage**: Maintain 80%+ test coverage
- **Test files**: Co-locate with source files (`component.test.tsx`)
- **Test utilities**: Use existing test utilities in `math.test.ts` as examples

### End-to-End Tests

- **Playwright**: Tests run automatically in CI
- **Critical paths**: Focus on user workflows (calculator usage, navigation)
- **Browser support**: Tests run on Chromium, Firefox, and WebKit

### Testing Checklist

- [ ] Unit tests for new calculation logic
- [ ] Component tests for new UI elements
- [ ] E2E tests for new user workflows
- [ ] Manual testing in browser
- [ ] Test edge cases and error conditions

## Pull Request Process

### Before Submitting

1. **Update development plan**:
   - Update `docs/development-plan.md` if adding new features
   - Mark completed tasks with ✅

2. **Final verification**:
   ```bash
   cd web
   npm run lint -- --fix         # Fix all linting issues
   npm run build                  # Ensure clean build
   npm run test                   # All tests pass
   npm run dev                    # Manual testing
   ```

3. **Commit all changes**:
   ```bash
   git add .
   git commit -m "docs: update development plan"
   git push origin feature/your-feature-name
   ```

### Submitting the PR

1. **Create pull request** via GitHub UI
2. **Fill out PR template** with:
   - Clear description of changes
   - Testing performed
   - Screenshots for UI changes
   - Links to related issues

3. **Request review** from maintainers

### PR Requirements

- [ ] All CI checks pass (linting, build, tests)
- [ ] Code follows established patterns and standards
- [ ] New functionality is tested
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)

## Types of Contributions

### Bug Fixes

- **Small fixes**: Direct PR with fix and test
- **Complex bugs**: Open issue first to discuss approach
- **Include**: Reproduction steps, fix description, tests

### New Features

- **Feature requests**: Open issue first for discussion
- **Implementation**: Follow architecture patterns
- **Include**: Tests, documentation, example usage

### Documentation

- **Improvements**: Clarify setup, usage, or development
- **New docs**: Follow existing structure and tone
- **Include**: Verify all code examples work

### Data Contributions

- **Materials**: Add new materials with proper cutting parameters
- **Tools**: Extend tool database with specifications
- **Include**: Validation tests and source references

## Coding Standards Reference

### ESLint Rules

Key enforced rules:
- `import/order`: Consistent import ordering
- `@typescript-eslint/no-floating-promises`: Handle async operations
- `eqeqeq`: Use strict equality (`===`)
- `@typescript-eslint/naming-convention`: Consistent naming

### Prettier Configuration

```json
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "es5"
}
```

### EditorConfig

- UTF-8 encoding
- LF line endings  
- 2-space indentation
- Trim trailing whitespace
- Insert final newline

## Getting Help

### Resources

- **[Coding Standards](docs/coding-standards.md)**: Detailed style guide
- **[Testing Guidelines](docs/testing-guidelines.md)**: Testing best practices
- **[Architecture Guide](docs/initial-architecture.md)**: System design
- **[Technical Spec](docs/initial-spec.md)**: Complete requirements

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Pull Request Reviews**: Feedback on specific changes

### Common Issues

**Husky errors during `npm install`**:
```bash
npm install --ignore-scripts  # Skip git hooks setup
```

**ESLint import order errors**:
```bash
npm run lint -- --fix  # Auto-fix import ordering
```

**TypeScript errors**:
- Check `web/tsconfig.json` for strict settings
- Ensure proper type imports and exports
- Use `unknown` instead of `any` when type is unclear

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code and ideas, not the person
- Help others learn and improve

Thank you for contributing to JustTheChips! 🛠️