# Testing Guidelines

This document outlines the testing strategy, conventions, and practices for the JustTheChips project.

## Overview

JustTheChips uses a comprehensive testing strategy that ensures code quality and reliability across all components. We follow the test pyramid principle with an emphasis on unit tests, supplemented by integration and end-to-end tests.

## Test Pyramid

### Unit Tests (Foundation)
- **Purpose**: Test individual functions, components, and modules in isolation
- **Tools**: Vitest + React Testing Library
- **Location**: `*.test.ts` or `*.test.tsx` files alongside source code
- **Coverage Target**: 80% minimum for statements, branches, functions, and lines
- **Examples**: Math utilities, data validation, calculation logic

### Integration Tests (Middle)
- **Purpose**: Test interactions between components and modules
- **Tools**: Vitest + React Testing Library with MSW for API mocking
- **Focus**: Component integration, data flow, state management
- **Examples**: Calculator form validation, data loading and processing

### End-to-End Tests (Top)
- **Purpose**: Test complete user workflows and scenarios
- **Tools**: Playwright
- **Location**: `tests/` directory in project root
- **Focus**: Critical user paths, cross-browser compatibility
- **Examples**: Complete calculation workflow, navigation, data import/export

## Test Structure and Conventions

### File Organization
```
src/
├── core/
│   ├── utils/
│   │   ├── math.ts
│   │   └── math.test.ts          # Unit tests for math utilities
│   ├── calculations/
│   │   ├── speeds.ts
│   │   └── speeds.test.ts        # Unit tests for speed calculations
│   └── data/
│       ├── schemas.ts
│       └── schemas.test.ts       # Schema validation tests
├── components/
│   ├── Calculator/
│   │   ├── Calculator.tsx
│   │   └── Calculator.test.tsx   # Component integration tests
│   └── shared/
└── pages/
    ├── Calculator.tsx
    └── Calculator.test.tsx       # Page-level integration tests
```

### Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Test descriptions: Use descriptive strings that explain the behavior
- Test structure: Follow AAA pattern (Arrange, Act, Assert)

### Example Test Structure
```typescript
import { describe, expect, it } from 'vitest'

import { functionUnderTest } from './module.js'

describe('ModuleName', () => {
  describe('functionUnderTest', () => {
    it('should return expected value for valid input', () => {
      // Arrange
      const input = 'valid input'
      const expected = 'expected output'

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle edge cases gracefully', () => {
      // Test edge cases, error conditions, boundary values
    })
  })
})
```

## Coverage Requirements

### Minimum Thresholds
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Exclusions
- Configuration files (`*.config.*`)
- Type definitions (`*.d.ts`)
- Entry points (`main.tsx`)
- Test files themselves
- Build artifacts and dependencies

### Running Coverage
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

## Testing Best Practices

### Unit Testing
1. **Test Pure Functions First**: Math utilities, calculations, validators
2. **Mock External Dependencies**: Use Vitest's mocking capabilities
3. **Test Edge Cases**: Boundary values, error conditions, invalid inputs
4. **Use Descriptive Test Names**: Should read like specifications
5. **Keep Tests Fast**: Unit tests should run in milliseconds

### Component Testing
1. **Test User Interactions**: Clicks, form submissions, keyboard navigation
2. **Test Props and State**: Component behavior with different inputs
3. **Mock Heavy Dependencies**: External services, complex calculations
4. **Test Accessibility**: Screen reader compatibility, keyboard navigation
5. **Use Testing Library Queries**: Prefer `getByRole`, `getByLabelText`

### Integration Testing
1. **Test Data Flow**: How components work together
2. **Test State Management**: Store updates, side effects
3. **Test Error Boundaries**: Error handling and recovery
4. **Test Loading States**: Async operations, loading indicators

### Test Data Management
1. **Use Factory Functions**: Create test data programmatically
2. **Avoid Test Interdependence**: Each test should be independent
3. **Clean Up After Tests**: Reset state, clear mocks
4. **Use Realistic Data**: Test with data similar to production

## Common Testing Patterns

### Testing Math Utilities
```typescript
describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 1, 10)).toBe(5)
  })

  it('should clamp to minimum when below range', () => {
    expect(clamp(-5, 1, 10)).toBe(1)
  })

  it('should clamp to maximum when above range', () => {
    expect(clamp(15, 1, 10)).toBe(10)
  })

  it('should handle floating point precision', () => {
    expect(clamp(3.14159, 2.0, 4.0)).toBeCloseTo(3.14159, 5)
  })
})
```

### Testing React Components
```typescript
import { render, screen, userEvent } from '@testing-library/react'

describe('Calculator', () => {
  it('should update RPM when spindle speed changes', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    const speedInput = screen.getByLabelText(/surface speed/i)
    await user.type(speedInput, '300')

    expect(screen.getByDisplayValue('300')).toBeInTheDocument()
  })
})
```

### Testing Async Operations
```typescript
import { waitFor } from '@testing-library/react'

it('should load material data', async () => {
  render(<MaterialSelector />)

  await waitFor(() => {
    expect(screen.getByText(/aluminum/i)).toBeInTheDocument()
  })
})
```

### Testing Error States
```typescript
it('should display error message for invalid input', () => {
  render(<SpeedInput value={-100} />)

  expect(screen.getByText(/speed must be positive/i)).toBeInTheDocument()
})
```

## Tools and Configuration

### Vitest Configuration
- **Environment**: jsdom for DOM testing
- **Setup Files**: Global test setup in `vitest.setup.ts`
- **Coverage Provider**: v8 for fast, accurate coverage
- **Globals**: Enabled for `describe`, `it`, `expect` without imports

### React Testing Library
- **Philosophy**: Test behavior, not implementation
- **Queries**: Prefer accessibility-based queries
- **User Events**: Use `@testing-library/user-event` for interactions
- **Assertions**: Custom jest-dom matchers for DOM testing

### Playwright (E2E)
- **Browsers**: Chrome, Firefox, Safari
- **Configuration**: Located in `playwright.config.js`
- **Test Location**: `tests/` directory
- **CI Integration**: Runs on pull requests and main branch

## Running Tests

### Development Workflow
```bash
# Run tests in watch mode during development
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI (when available)
npm run test:ui

# Run specific test file
npm run test math.test.ts

# Run end-to-end tests
npx playwright test
```

### Continuous Integration
Tests run automatically on:
- Pull requests to main branch
- Pushes to main branch
- All tests must pass before merging

## Debugging Tests

### Common Issues and Solutions

1. **Tests timing out**: Increase timeout for async operations
2. **DOM not updating**: Use `waitFor` for async state changes
3. **Mock not working**: Ensure mock is called before importing module
4. **Coverage too low**: Add tests for uncovered branches and functions

### Debugging Tools
- **Test UI**: Visual test runner (when available)
- **Debug mode**: Run tests with `--debug` flag
- **Console logs**: Use `screen.debug()` to inspect DOM
- **Playwright inspector**: Visual debugging for E2E tests

## Contributing

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Maintain coverage thresholds**
3. **Follow existing patterns** in test structure
4. **Update documentation** if adding new testing utilities
5. **Consider edge cases** and error conditions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)