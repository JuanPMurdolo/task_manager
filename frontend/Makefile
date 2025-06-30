# Makefile for Task Manager Frontend

# Variables
NODE_VERSION := 18
NPM := npm
NEXT := npx next
JEST := npx jest
PORT := 3000

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Help target
.PHONY: help
help: ## Show this help message
	@echo "$(GREEN)Task Manager Frontend - Available Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Installation and Setup
.PHONY: install
install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	$(NPM) install

.PHONY: clean
clean: ## Clean node_modules and build artifacts
	@echo "$(YELLOW)Cleaning project...$(NC)"
	rm -rf node_modules
	rm -rf .next
	rm -rf coverage
	rm -rf dist

.PHONY: fresh-install
fresh-install: clean install ## Clean install dependencies
	@echo "$(GREEN)Fresh installation completed$(NC)"

# Development
.PHONY: dev
dev: ## Start development server
	@echo "$(GREEN)Starting development server on port $(PORT)...$(NC)"
	$(NEXT) dev -p $(PORT)

.PHONY: build
build: ## Build the application for production
	@echo "$(GREEN)Building application...$(NC)"
	$(NEXT) build

.PHONY: start
start: ## Start production server
	@echo "$(GREEN)Starting production server...$(NC)"
	$(NEXT) start

.PHONY: lint
lint: ## Run ESLint
	@echo "$(GREEN)Running ESLint...$(NC)"
	$(NPM) run lint

.PHONY: lint-fix
lint-fix: ## Run ESLint with auto-fix
	@echo "$(GREEN)Running ESLint with auto-fix...$(NC)"
	$(NPM) run lint -- --fix

# Testing
.PHONY: test
test: ## Run all tests
	@echo "$(GREEN)Running all tests...$(NC)"
	$(JEST)

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	$(JEST) --watch

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	$(JEST) --coverage

.PHONY: test-unit
test-unit: ## Run unit tests only
	@echo "$(GREEN)Running unit tests...$(NC)"
	$(JEST) __tests__/components/

.PHONY: test-integration
test-integration: ## Run integration tests only
	@echo "$(GREEN)Running integration tests...$(NC)"
	$(JEST) __tests__/integration/

.PHONY: test-ci
test-ci: ## Run tests for CI (with coverage and no watch)
	@echo "$(GREEN)Running tests for CI...$(NC)"
	$(JEST) --coverage --watchAll=false --passWithNoTests

.PHONY: test-debug
test-debug: ## Run tests in debug mode
	@echo "$(GREEN)Running tests in debug mode...$(NC)"
	node --inspect-brk node_modules/.bin/jest --runInBand

.PHONY: test-specific
test-specific: ## Run specific test file (usage: make test-specific FILE=path/to/test.tsx)
	@echo "$(GREEN)Running specific test: $(FILE)$(NC)"
	$(JEST) $(FILE)

# Type checking
.PHONY: type-check
type-check: ## Run TypeScript type checking
	@echo "$(GREEN)Running TypeScript type checking...$(NC)"
	npx tsc --noEmit

# Quality checks
.PHONY: check
check: lint type-check test ## Run all quality checks (lint, type-check, test)
	@echo "$(GREEN)All quality checks completed$(NC)"

# Development workflow
.PHONY: dev-setup
dev-setup: install ## Setup development environment
	@echo "$(GREEN)Development environment setup completed$(NC)"
	@echo "$(YELLOW)Run 'make dev' to start the development server$(NC)"

.PHONY: pre-commit
pre-commit: lint type-check test-ci ## Run pre-commit checks
	@echo "$(GREEN)Pre-commit checks completed$(NC)"

# Docker support (if needed)
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t task-manager-frontend .

.PHONY: docker-run
docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	docker run -p $(PORT):$(PORT) task-manager-frontend

# Utility commands
.PHONY: info
info: ## Show project information
	@echo "$(GREEN)Project Information$(NC)"
	@echo "Node version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@echo "Next.js version: $(shell npx next --version)"
	@echo "Port: $(PORT)"

.PHONY: deps-check
deps-check: ## Check for outdated dependencies
	@echo "$(GREEN)Checking for outdated dependencies...$(NC)"
	$(NPM) outdated

.PHONY: deps-update
deps-update: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(NC)"
	$(NPM) update

# Test specific components
.PHONY: test-login
test-login: ## Test login form component
	@echo "$(GREEN)Testing login form...$(NC)"
	$(JEST) __tests__/components/login-form.test.tsx

.PHONY: test-dashboard
test-dashboard: ## Test dashboard component
	@echo "$(GREEN)Testing dashboard...$(NC)"
	$(JEST) __tests__/components/task-dashboard.test.tsx

.PHONY: test-task-list
test-task-list: ## Test task list component
	@echo "$(GREEN)Testing task list...$(NC)"
	$(JEST) __tests__/components/task-list.test.tsx

.PHONY: test-user-management
test-user-management: ## Test user management component
	@echo "$(GREEN)Testing user management...$(NC)"
	$(JEST) __tests__/components/user-management.test.tsx

# Performance and analysis
.PHONY: analyze
analyze: ## Analyze bundle size
	@echo "$(GREEN)Analyzing bundle size...$(NC)"
	ANALYZE=true $(NPM) run build

.PHONY: lighthouse
lighthouse: ## Run Lighthouse audit (requires lighthouse CLI)
	@echo "$(GREEN)Running Lighthouse audit...$(NC)"
	npx lighthouse http://localhost:$(PORT) --output=html --output-path=./lighthouse-report.html

# Maintenance
.PHONY: audit
audit: ## Run security audit
	@echo "$(GREEN)Running security audit...$(NC)"
	$(NPM) audit

.PHONY: audit-fix
audit-fix: ## Fix security vulnerabilities
	@echo "$(GREEN)Fixing security vulnerabilities...$(NC)"
	$(NPM) audit fix

# Quick development commands
.PHONY: quick-test
quick-test: ## Quick test run (no coverage)
	@echo "$(GREEN)Running quick tests...$(NC)"
	$(JEST) --passWithNoTests

.PHONY: quick-check
quick-check: lint quick-test ## Quick quality check
	@echo "$(GREEN)Quick checks completed$(NC)"

# Environment specific
.PHONY: dev-full
dev-full: install lint type-check test dev ## Full development setup and start
	@echo "$(GREEN)Full development environment ready$(NC)"

# Cleanup commands
.PHONY: clean-cache
clean-cache: ## Clean Next.js and Jest cache
	@echo "$(YELLOW)Cleaning caches...$(NC)"
	$(NEXT) clean
	$(JEST) --clearCache

.PHONY: reset
reset: clean-cache clean fresh-install ## Complete project reset
	@echo "$(GREEN)Project reset completed$(NC)"

# CI/CD helpers
.PHONY: ci-install
ci-install: ## Install dependencies for CI
	@echo "$(GREEN)Installing dependencies for CI...$(NC)"
	$(NPM) ci

.PHONY: ci-test
ci-test: ci-install test-ci ## Run CI test pipeline
	@echo "$(GREEN)CI test pipeline completed$(NC)"

.PHONY: ci-build
ci-build: ci-install build ## Run CI build pipeline
	@echo "$(GREEN)CI build pipeline completed$(NC)"

# Documentation
.PHONY: docs
docs: ## Generate documentation
	@echo "$(GREEN)Generating documentation...$(NC)"
	@echo "Available commands:"
	@make help

# Status check
.PHONY: status
status: ## Show project status
	@echo "$(GREEN)Project Status$(NC)"
	@echo "Dependencies: $(shell [ -d node_modules ] && echo 'Installed' || echo 'Not installed')"
	@echo "Build: $(shell [ -d .next ] && echo 'Built' || echo 'Not built')"
	@echo "Tests: $(shell $(JEST) --passWithNoTests --silent 2>/dev/null && echo 'Passing' || echo 'Failing')"

# Watch commands
.PHONY: watch-test
watch-test: ## Watch tests and re-run on changes
	@echo "$(GREEN)Watching tests...$(NC)"
	$(JEST) --watch --verbose

.PHONY: watch-build
watch-build: ## Watch and rebuild on changes
	@echo "$(GREEN)Watching build...$(NC)"
	$(NEXT) build --watch
