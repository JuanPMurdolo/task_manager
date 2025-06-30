# Makefile for FastAPI Backend Project
# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
PURPLE=\033[0;35m
CYAN=\033[0;36m
WHITE=\033[1;37m
NC=\033[0m # No Color

# Project variables
PROJECT_NAME=backend
PYTHON=python3
PIP=pip3
VENV_NAME=venv
VENV_ACTIVATE=. $(VENV_NAME)/bin/activate
REQUIREMENTS=requirements.txt

# Help target
.PHONY: help
help: ## Show this help message
	@echo "$(CYAN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Environment Setup
.PHONY: setup
setup: ## Set up the development environment
	@echo "$(YELLOW)Setting up development environment...$(NC)"
	$(PYTHON) -m venv $(VENV_NAME)
	$(VENV_ACTIVATE) && $(PIP) install --upgrade pip
	$(VENV_ACTIVATE) && $(PIP) install -r $(REQUIREMENTS)
	@echo "$(GREEN)✓ Development environment ready!$(NC)"

.PHONY: install
install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	$(PIP) install -r $(REQUIREMENTS)
	@echo "$(GREEN)✓ Dependencies installed!$(NC)"

.PHONY: install-dev
install-dev: ## Install development dependencies
	@echo "$(YELLOW)Installing development dependencies...$(NC)"
	$(PIP) install -r requirements-dev.txt
	@echo "$(GREEN)✓ Development dependencies installed!$(NC)"

.PHONY: freeze
freeze: ## Freeze current dependencies
	@echo "$(YELLOW)Freezing dependencies...$(NC)"
	$(PIP) freeze > $(REQUIREMENTS)
	@echo "$(GREEN)✓ Dependencies frozen to $(REQUIREMENTS)$(NC)"

# Development
.PHONY: dev
dev: ## Start development server with auto-reload
	@echo "$(CYAN)Starting development server...$(NC)"
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: run
run: ## Run the application
	@echo "$(CYAN)Starting application...$(NC)"
	uvicorn app.main:app --host 0.0.0.0 --port 8000

.PHONY: shell
shell: ## Start Python shell with app context
	@echo "$(CYAN)Starting Python shell...$(NC)"
	$(PYTHON) -i -c "from app.main import app; print('App loaded. Use app variable.')"

# Testing
.PHONY: test
test: ## Run all tests
	@echo "$(YELLOW)Running tests...$(NC)"
	pytest -v

.PHONY: test-fast
test-fast: ## Run tests without slow tests
	@echo "$(YELLOW)Running fast tests...$(NC)"
	pytest -v -m "not slow"

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	pytest --cov=app --cov-report=html --cov-report=term-missing

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "$(YELLOW)Running tests in watch mode...$(NC)"
	pytest-watch

.PHONY: test-auth
test-auth: ## Run authentication tests only
	@echo "$(YELLOW)Running authentication tests...$(NC)"
	pytest test/test_auth* -v

.PHONY: test-task
test-task: ## Run task tests only
	@echo "$(YELLOW)Running task tests...$(NC)"
	pytest test/test_task* -v

.PHONY: test-repo
test-repo: ## Run repository tests only
	@echo "$(YELLOW)Running repository tests...$(NC)"
	pytest test/test_*_repository.py -v

# Code Quality
.PHONY: format
format: ## Format code with black and isort
	@echo "$(YELLOW)Formatting code...$(NC)"
	black app/ test/
	isort app/ test/
	@echo "$(GREEN)✓ Code formatted!$(NC)"

.PHONY: lint
lint: ## Lint code with flake8
	@echo "$(YELLOW)Linting code...$(NC)"
	flake8 app/ test/
	@echo "$(GREEN)✓ Code linted!$(NC)"

.PHONY: type-check
type-check: ## Type check with mypy
	@echo "$(YELLOW)Type checking...$(NC)"
	mypy app/
	@echo "$(GREEN)✓ Type checking complete!$(NC)"

.PHONY: security
security: ## Security check with bandit
	@echo "$(YELLOW)Running security checks...$(NC)"
	bandit -r app/
	@echo "$(GREEN)✓ Security check complete!$(NC)"

.PHONY: check-all
check-all: format lint type-check security ## Run all code quality checks
	@echo "$(GREEN)✓ All checks completed!$(NC)"

# Database
.PHONY: db-init
db-init: ## Initialize database
	@echo "$(YELLOW)Initializing database...$(NC)"
	$(PYTHON) -c "from app.core.database import init_db; import asyncio; asyncio.run(init_db())"
	@echo "$(GREEN)✓ Database initialized!$(NC)"

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	alembic upgrade head
	@echo "$(GREEN)✓ Database migrated!$(NC)"

.PHONY: db-reset
db-reset: ## Reset database
	@echo "$(RED)Resetting database...$(NC)"
	rm -f tasks.db
	$(MAKE) db-init
	@echo "$(GREEN)✓ Database reset!$(NC)"

.PHONY: db-seed
db-seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(NC)"
	$(PYTHON) scripts/seed_db.py
	@echo "$(GREEN)✓ Database seeded!$(NC)"

# Docker
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(YELLOW)Building Docker image...$(NC)"
	docker build -t $(PROJECT_NAME) .
	@echo "$(GREEN)✓ Docker image built!$(NC)"

.PHONY: docker-run
docker-run: ## Run Docker container
	@echo "$(CYAN)Running Docker container...$(NC)"
	docker run -p 8000:8000 $(PROJECT_NAME)

.PHONY: docker-dev
docker-dev: ## Run Docker container in development mode
	@echo "$(CYAN)Running Docker container in dev mode...$(NC)"
	docker run -p 8000:8000 -v $(PWD):/app $(PROJECT_NAME)

# Cleanup
.PHONY: clean
clean: ## Clean up temporary files
	@echo "$(YELLOW)Cleaning up...$(NC)"
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf dist/
	rm -rf build/
	@echo "$(GREEN)✓ Cleanup complete!$(NC)"

.PHONY: clean-all
clean-all: clean ## Clean everything including venv
	@echo "$(RED)Removing virtual environment...$(NC)"
	rm -rf $(VENV_NAME)
	@echo "$(GREEN)✓ Everything cleaned!$(NC)"

# Documentation
.PHONY: docs
docs: ## Generate API documentation
	@echo "$(YELLOW)Generating documentation...$(NC)"
	$(PYTHON) -c "import app.main; print('API docs available at: http://localhost:8000/docs')"
	@echo "$(GREEN)✓ Documentation ready!$(NC)"

.PHONY: docs-serve
docs-serve: ## Serve documentation
	@echo "$(CYAN)Serving documentation...$(NC)"
	$(MAKE) dev

# Deployment
.PHONY: deploy-check
deploy-check: ## Check if ready for deployment
	@echo "$(YELLOW)Checking deployment readiness...$(NC)"
	$(MAKE) test
	$(MAKE) check-all
	@echo "$(GREEN)✓ Ready for deployment!$(NC)"

.PHONY: build
build: ## Build for production
	@echo "$(YELLOW)Building for production...$(NC)"
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) test
	@echo "$(GREEN)✓ Build complete!$(NC)"

# Monitoring
.PHONY: logs
logs: ## Show application logs
	@echo "$(CYAN)Showing logs...$(NC)"
	tail -f app.log

.PHONY: health
health: ## Check application health
	@echo "$(YELLOW)Checking application health...$(NC)"
	curl -f http://localhost:8000/health || echo "$(RED)Application not responding$(NC)"

# Utilities
.PHONY: info
info: ## Show project information
	@echo "$(CYAN)Project Information:$(NC)"
	@echo "$(WHITE)Name:$(NC) $(PROJECT_NAME)"
	@echo "$(WHITE)Python:$(NC) $(shell $(PYTHON) --version)"
	@echo "$(WHITE)Pip:$(NC) $(shell $(PIP) --version)"
	@echo "$(WHITE)Virtual Env:$(NC) $(VENV_NAME)"
	@echo "$(WHITE)Requirements:$(NC) $(REQUIREMENTS)"

.PHONY: deps
deps: ## Show dependency tree
	@echo "$(YELLOW)Dependency tree:$(NC)"
	pipdeptree

.PHONY: outdated
outdated: ## Show outdated packages
	@echo "$(YELLOW)Outdated packages:$(NC)"
	$(PIP) list --outdated

.PHONY: upgrade
upgrade: ## Upgrade all packages
	@echo "$(YELLOW)Upgrading packages...$(NC)"
	$(PIP) list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 $(PIP) install -U
	@echo "$(GREEN)✓ Packages upgraded!$(NC)"

# CI/CD
.PHONY: ci-test
ci-test: ## Run tests for CI/CD
	@echo "$(YELLOW)Running CI tests...$(NC)"
	pytest --junitxml=test-results.xml --cov=app --cov-report=xml

.PHONY: pre-commit
pre-commit: ## Run pre-commit checks
	@echo "$(YELLOW)Running pre-commit checks...$(NC)"
	$(MAKE) format
	$(MAKE) lint
	$(MAKE) test-fast
	@echo "$(GREEN)✓ Pre-commit checks passed!$(NC)"

# Default target
.DEFAULT_GOAL := help
