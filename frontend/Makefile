# Makefile para Lemon Task Manager Frontend

# Variables
NODE_VERSION := 18
NPM := npm
NEXT := npx next
JEST := npx jest
PORT := 3000

# Colores
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Installation y Setup
.PHONY: install
install: ## Instalar dependencias
	@echo "$(GREEN)Installing dependencies...$(NC)"
	$(NPM) install

.PHONY: clean
clean: ## Limpiar el proyecto
	@echo "$(YELLOW)Cleaning project...$(NC)"
	rm -rf node_modules
	rm -rf .next
	rm -rf coverage
	rm -rf dist

# Development
.PHONY: dev
dev: ## Iniciar el servidor en modo desarrollo
	@echo "$(GREEN)Starting development server on port $(PORT)...$(NC)"
	$(NEXT) dev -p $(PORT)

.PHONY: build
build: ## Hacer build de la aplicación
	@echo "$(GREEN)Building application...$(NC)"
	$(NEXT) build

.PHONY: start
start: ## Iniciar el servidor en modo producción
	@echo "$(GREEN)Starting production server...$(NC)"
	$(NEXT) start

# Testing
.PHONY: test
test: ## Correr todos los tests
	@echo "$(GREEN)Running all tests...$(NC)"
	$(JEST)

.PHONY: test-watch
test-watch: ## Correr tests en modo watch
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	$(JEST) --watch

.PHONY: test-coverage
test-coverage: ## Correr tests con cobertura
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	$(JEST) --coverage

# Development workflow
.PHONY: dev-setup
dev-setup: install ## Setear el entorno de desarrollo
	@echo "$(GREEN)Development environment setup completed$(NC)"
	@echo "$(YELLOW)Run 'make dev' to start the development server$(NC)"

# Docker support (if needed)
.PHONY: docker-build
docker-build: ## Hacer build de Docker
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t task-manager-frontend .

.PHONY: docker-run
docker-run: ## Correr Docker
	@echo "$(GREEN)Running Docker container...$(NC)"
	docker run -p $(PORT):$(PORT) task-manager-frontend
