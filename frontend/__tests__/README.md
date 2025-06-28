# Test Suite Documentation

This directory contains comprehensive tests for the Task Management System frontend.

## Test Structure

\`\`\`
__tests__/
├── components/          # Unit tests for React components
│   ├── login-form.test.tsx
│   ├── task-dashboard.test.tsx
│   ├── task-list.test.tsx
│   ├── task-form.test.tsx
│   ├── task-filters.test.tsx
│   ├── user-management.test.tsx
│   └── user-form.test.tsx
├── integration/         # Integration tests
│   └── task-management.test.tsx
└── utils/              # Test utilities and helpers
    └── test-utils.tsx
\`\`\`

## Test Coverage

### Component Tests (Unit)
- **LoginForm**: Authentication form testing
- **TaskDashboard**: Main dashboard functionality
- **TaskList**: Task display and interactions
- **TaskForm**: Task creation/editing forms
- **TaskFilters**: Search and filtering functionality
- **UserManagement**: User CRUD operations
- **UserForm**: User creation/editing forms

### Integration Tests
- Complete user workflows
- End-to-end task management scenarios
- Cross-component interactions

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- task-dashboard.test.tsx

# Run in watch mode
npm test -- --watch

# Using the test runner script
./scripts/run-tests.sh all
./scripts/run-tests.sh coverage
./scripts/run-tests.sh unit
./scripts/run-tests.sh integration
\`\`\`

## Test Utilities

### Mock Data
- `mockTasks`: Sample task data
- `mockUsers`: Sample user data
- `mockCurrentUser`: Current authenticated user

### Mock Functions
- `mockFetchSuccess()`: Mock successful API responses
- `mockFetchError()`: Mock API error responses
- `mockFetchReject()`: Mock network errors

### Helper Functions
- `setupUser()`: Initialize user event testing
- `waitForLoadingToFinish()`: Wait for async operations
- `mockLocalStorage()`: Mock browser localStorage

## Testing Patterns

### Component Rendering
\`\`\`tsx
it("renders component correctly", () => {
  render(<Component />)
  expect(screen.getByText("Expected Text")).toBeInTheDocument()
})
\`\`\`

### User Interactions
\`\`\`tsx
it("handles user interaction", async () => {
  const user = setupUser()
  render(<Component />)
  
  await user.click(screen.getByRole("button"))
  expect(mockFunction).toHaveBeenCalled()
})
\`\`\`

### API Mocking
\`\`\`tsx
it("handles API calls", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(mockData),
  })
  
  render(<Component />)
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })
})
\`\`\`

### Error Handling
\`\`\`tsx
it("handles errors gracefully", async () => {
  mockFetch.mockRejectedValueOnce(new Error("Network error"))
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
\`\`\`

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does
2. **Use Realistic Data**: Mock data should match real API responses
3. **Test Error States**: Always test error handling and edge cases
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Use Descriptive Names**: Test names should clearly describe what is being tested
6. **Mock External Dependencies**: Mock API calls, localStorage, etc.
7. **Test Accessibility**: Ensure components are accessible to screen readers

## Debugging Tests

### Common Issues
1. **Element Not Found**: Check selectors and wait for async operations
2. **Act Warnings**: Wrap state updates in `act()` or use `waitFor()`
3. **Mock Issues**: Ensure mocks are properly reset between tests
4. **Timing Issues**: Use `waitFor()` for async operations

### Debug Commands
\`\`\`bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file
npm test -- --testNamePattern="specific test name"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
\`\`\`

## Continuous Integration

Tests are configured to run automatically on:
- Pull requests
- Main branch commits
- Release builds

The test suite must pass before code can be merged.
