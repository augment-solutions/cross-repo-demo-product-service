# Makefile for Product Service
.PHONY: all build test lint clean help

SERVICE_NAME := product-service
DOCKER_REGISTRY ?= 
TAG ?= latest

# Default target
all: build

# Development
dev: ## Start service in development mode
	npm run dev

run-dev: dev

run-prod: ## Start service in production mode
	npm run start

# Building
build: ## Build the service
	npm run build

docker-build: ## Build Docker image
	docker build -f ../../.config/docker/production.dockerfile -t ecomm-$(SERVICE_NAME):$(TAG) .

docker-push: ## Push Docker image to registry
	docker push $(DOCKER_REGISTRY)/ecomm-$(SERVICE_NAME):$(TAG)

# Testing
test: ## Run all tests
	npm test

test-unit: ## Run unit tests
	npm run test:unit

test-integration: ## Run integration tests
	npm run test:integration

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npm run test:coverage

# Code Quality
lint: ## Run linter
	npm run lint

lint-fix: ## Run linter with auto-fix
	npm run lint:fix

format: ## Format code
	npm run format

type-check: ## Run type checking
	npm run type-check

# Database
migrate-up: ## Run database migrations
	npx prisma migrate deploy

migrate-down: ## Rollback database migrations
	npx prisma migrate reset

generate: ## Generate Prisma client
	npx prisma generate

# Cleanup
clean: ## Clean build artifacts
	rm -rf dist coverage .cache

# Help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  %-20s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

