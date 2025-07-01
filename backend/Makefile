# Makefile para Lemon FastAPI Backend Project
# Colores
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
PURPLE=\033[0;35m
CYAN=\033[0;36m
WHITE=\033[1;37m
NC=\033[0m # No Color

# Variables del proyecto
PROJECT_NAME=backend
PYTHON=python3
PIP=pip3
VENV_NAME=venv
VENV_ACTIVATE=. $(VENV_NAME)/bin/activate
REQUIREMENTS=requirements.txt

# Setup del ambiente
.PHONY: setup
setup: ## Crea el entorno virtual e instala dependencias
	@echo "$(YELLOW)Setting up development environment...$(NC)"
	$(PYTHON) -m venv $(VENV_NAME)
	$(VENV_ACTIVATE) && $(PIP) install --upgrade pip
	$(VENV_ACTIVATE) && $(PIP) install -r $(REQUIREMENTS)
	@echo "$(GREEN)✓ Development environment ready!$(NC)"
	@echo "$(CYAN) Para activar el venv, correr: source ./$(VENV_NAME)/bin/activate$(NC) for macOS/Linux"
	@echo "$(CYAN) Para activar el venv, correr: '.\$(VENV_NAME)\Scripts\activate$(NC)' for Windows"

.PHONY: install
install: ##Instala dependencias
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	$(PIP) install -r $(REQUIREMENTS)
	@echo "$(GREEN)✓ Dependencies installed!$(NC)"

# Development
.PHONY: dev
dev: ## Inicia el servidor en modo desarrollo
	@echo "$(CYAN)Starting development server...$(NC)"
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: run
run: ## Corre la aplicacion
	@echo "$(CYAN)Starting application...$(NC)"
	uvicorn app.main:app --host 0.0.0.0 --port 8000

# Testing
.PHONY: test
test: ## Corre los tests
	@echo "$(YELLOW)Running tests...$(NC)"
	pytest -v

.PHONY: test-coverage
test-coverage: ## Corre los tests con cobertura
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	pytest --cov=app --cov-report=html --cov-report=term-missing


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

# Docker
.PHONY: docker-build
docker-build: ## Hacer build de Docker
	@echo "$(YELLOW)Building Docker image...$(NC)"
	docker build -t $(PROJECT_NAME) .
	@echo "$(GREEN)✓ Docker image built!$(NC)"

.PHONY: docker-run
docker-run: ## Correr Docker
	@echo "$(CYAN)Running Docker container...$(NC)"
	docker run -p 8000:8000 $(PROJECT_NAME)

.PHONY: docker-dev
docker-dev: ## Correr Docker en modo desarrollo
	@echo "$(CYAN)Running Docker container in dev mode...$(NC)"
	docker run -p 8000:8000 -v $(PWD):/app $(PROJECT_NAME)

# Default target
.DEFAULT_GOAL := help
