# 🧪 Testing Guide

This guide covers the testing strategy and practices for Rapid Work Tracker.

## Current Status

> **Work In Progress**: Testing infrastructure is currently being developed. Only business logic tests for the domain layer are currently implemented.

## Test Structure

```
packages/domain-rapid-work/tests/
├── features/           # Feature-level tests
├── helpers/           # Test utilities
└── mocks/            # Mock implementations
```

## Available Test Commands

### Basic Commands
```bash
pnpm test              # Run all tests
pnpm test:web          # Run web application tests
pnpm test:domain       # Run domain package tests
```

### Advanced Commands (using just-task)
```bash
pnpm test:all                    # Run all tests (packages in parallel)
pnpm test:package --package web  # Run all tests for a specific package
pnpm test:type --type unit       # Run all unit tests across packages
pnpm test:suite --package web --type integration  # Run specific test suite
pnpm test:list                   # Show all available test configurations
```

### Package-specific Shortcuts
```bash
pnpm test:web:unit               # Web unit tests only
pnpm test:web:integration        # Web integration tests only
pnpm test:unit                   # All unit tests (parallel)
pnpm test:integration            # All integration tests
```

## Domain Tests (Currently Available)

The domain package includes comprehensive tests for:

- **Task Management**: Creating, updating, and deleting tasks
- **Domain/Subdomain Logic**: Organizing work hierarchically
- **Session Tracking**: Time tracking functionality
- **Business Rules**: Core business logic validation

### Running Domain Tests
```bash
cd packages/domain-rapid-work
npm test
```

## Future Testing Plans

### Frontend Testing
- **Component Tests**: React component testing with Testing Library
- **Integration Tests**: Testing component interactions
- **E2E Tests**: Full application workflow testing

### Backend Testing
- **Controller Tests**: API endpoint testing
- **Service Tests**: Business service testing
- **Database Tests**: Repository and migration testing

### Test Coverage Goals
- Minimum 80% test coverage
- Critical paths 100% covered
- All business logic thoroughly tested

## Testing Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test Naming**: Descriptive test names explaining behavior
3. **Mocking**: Use mocks for external dependencies
4. **Isolation**: Each test should be independent
5. **Fast Execution**: Tests should run quickly

## Contributing to Tests

When adding new features:
1. Write tests for new functionality
2. Ensure existing tests still pass
3. Aim for good test coverage
4. Document any special testing requirements
