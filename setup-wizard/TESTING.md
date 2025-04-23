
# Neptuno Project - Testing Guide

This document explains how to run tests for the Neptuno project.

## Setup

Make sure you have all dependencies installed:

```bash
npm install
```

## Running Tests

### Running All Tests

To run all tests in the project:

```bash
npm test
```

### Running Specific Tests

To run tests for a specific component or directory:

```bash
npm test -- src/components/setup
```

To run a specific test file:

```bash
npm test -- src/components/setup/__tests__/InstallConfirmDialog.test.tsx
```

### Test Coverage

To run tests with coverage report:

```bash
npm test -- --coverage
```

## Test Structure

- Unit tests are located in `__tests__` folders next to the components they test
- Tests use Vitest as the test runner
- React Testing Library is used for component testing
- Tests focus on user behavior rather than implementation details

## Writing Tests

When writing new tests:

1. Create test files in a `__tests__` folder adjacent to the component being tested
2. Use `describe` blocks to group related tests
3. Use `it` or `test` for individual test cases
4. Use React Testing Library to interact with components
5. Use assertions to verify expected behavior

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Mocking

For mocks, use Vitest's mocking capabilities:

```typescript
import { vi } from 'vitest';

vi.mock('@/utils/someUtil', () => ({
  someFunction: vi.fn().mockReturnValue('mocked value')
}));
```

## Debugging Tests

To debug failing tests, you can:

1. Use `console.log` statements in tests
2. Use `screen.debug()` to output the current DOM
3. Add `test.only` to focus on a specific test
