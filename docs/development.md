# 🛠️ Development Guide

This guide covers development practices, scripts, and tools used in the Rapid Work Tracker project.

## Available Scripts

### Development
```bash
pnpm dev          # Start all development servers
pnpm dev:web      # Start only the web application
```

### Build
```bash
pnpm build        # Build all packages and applications
pnpm build:web    # Build only the web application
```

### Testing
```bash
pnpm test         # Run all tests
pnpm test:web     # Run web application tests

# Advanced test commands (using just-task)
pnpm test:all                    # Run all tests (packages in parallel)
pnpm test:package --package web  # Run all tests for a specific package
pnpm test:type --type unit       # Run all unit tests across packages
pnpm test:suite --package web --type integration  # Run specific test suite
pnpm test:list                   # Show all available test configurations

# Package-specific shortcuts
pnpm test:domain                 # All domain tests
pnpm test:web:unit               # Web unit tests only
pnpm test:web:integration        # Web integration tests only
pnpm test:unit                   # All unit tests (parallel)
pnpm test:integration            # All integration tests
```

### Database
```bash
# From apps/rapidwork-web directory
node ace migration:run     # Run migrations
node ace migration:rollback # Rollback migrations
node ace db:seed           # Seed database
```

## Development Tools

This project includes these development tools:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vite](https://vitejs.dev/) for fast development and building
- [just-task](https://github.com/microsoft/just) for test orchestration and parallel execution

## Code Quality

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) with strict type checking enabled.

## Testing Strategy

> **Note**: Tests will be added soon. The current test coverage is incomplete and under development.

The testing strategy includes:
- **Unit Tests**: Testing individual components and functions
- **Integration Tests**: Testing component interactions
- **Domain Tests**: Business logic validation (currently implemented)

## Development Workflow

1. Create feature branch from `main`
2. Make changes with proper commit messages
3. Run tests and linting
4. Create merge request
5. Deploy via CI/CD pipeline

## Troubleshooting

### Common Issues

1. **Tuyau Type Generation**: See [Getting Started](./getting-started.md#workaround-required-tuyau-type-generation)
2. **Database Connection**: Ensure PostgreSQL is running and configured
3. **Port Conflicts**: Default ports are 3333 (backend) and 5173 (frontend)
