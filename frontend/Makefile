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

# Development workflow
.PHONY: dev-setup
dev-setup: install ## Setup development environment
	@echo "$(GREEN)Development environment setup completed$(NC)"
	@echo "$(YELLOW)Run 'make dev' to start the development server$(NC)"

# Docker support (if needed)
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t task-manager-frontend .

.PHONY: docker-run
docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	docker run -p $(PORT):$(PORT) task-manager-frontend
