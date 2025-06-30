# Task Manager Frontend

A modern task management application built with Next.js, TypeScript, and Tailwind CSS.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

\`\`\`bash
# Install dependencies
make install

# Start development server
make dev
\`\`\`

The application will be available at `http://localhost:3000`

## Available Commands

### Development
- `make dev` - Start development server
- `make build` - Build for production
- `make start` - Start production server
- `make dev-setup` - Complete development environment setup

### Testing
- `make test` - Run all tests
- `make test-watch` - Run tests in watch mode
- `make test-coverage` - Run tests with coverage report
- `make test-unit` - Run unit tests only
- `make test-integration` - Run integration tests only
- `make test-ci` - Run tests for CI environment

### Quality Checks
- `make lint` - Run ESLint
- `make lint-fix` - Run ESLint with auto-fix
- `make type-check` - Run TypeScript type checking
- `make check` - Run all quality checks (lint + type-check + test)

### Specific Component Tests
- `make test-login` - Test login form
- `make test-dashboard` - Test dashboard
- `make test-task-list` - Test task list
- `make test-user-management` - Test user management

### Maintenance
- `make clean` - Clean build artifacts
- `make fresh-install` - Clean install dependencies
- `make audit` - Run security audit
- `make deps-check` - Check for outdated dependencies

### Utilities
- `make help` - Show all available commands
- `make info` - Show project information
- `make status` - Show project status

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
├── __tests__/            # Test files
│   ├── components/       # Component tests
│   ├── integration/      # Integration tests
│   └── test-utils/       # Test utilities
├── lib/                  # Utility functions
└── public/              # Static assets
\`\`\`

## Testing

The project uses Jest and React Testing Library for testing:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions and workflows
- **Coverage**: Aim for >80% test coverage

### Running Tests

\`\`\`bash
# Run all tests
make test

# Run tests in watch mode during development
make test-watch

# Run tests with coverage report
make test-coverage

# Run specific test file
make test-specific FILE=__tests__/components/login-form.test.tsx
\`\`\`

## Development Workflow

1. **Setup**: `make dev-setup`
2. **Development**: `make dev`
3. **Testing**: `make test-watch` (in another terminal)
4. **Quality Check**: `make check` (before committing)
5. **Build**: `make build` (before deployment)

## Code Quality

The project enforces code quality through:
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Type safety and better developer experience
- **Prettier**: Code formatting (via ESLint)
- **Jest**: Comprehensive testing

## Environment Variables

Create a `.env.local` file for local development:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Other environment variables...
\`\`\`

## Deployment

### Production Build
\`\`\`bash
make build
make start
\`\`\`

### Docker (Optional)
\`\`\`bash
make docker-build
make docker-run
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks: `make check`
5. Submit a pull request

## Troubleshooting

### Common Issues

**Dependencies not installing:**
\`\`\`bash
make clean
make fresh-install
\`\`\`

**Tests failing:**
\`\`\`bash
make clean-cache
make test
\`\`\`

**Build errors:**
\`\`\`bash
make type-check
make lint
\`\`\`

### Getting Help

- Run `make help` to see all available commands
- Run `make status` to check project health
- Run `make info` to see environment information

## License

This project is licensed under the MIT License.
