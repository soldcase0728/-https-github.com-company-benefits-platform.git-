SHELL := /bin/bash
COMPOSE_FILE := deploy/docker-compose/compose.yml

.PHONY: dev-up dev-down logs build clean help status restart

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev-up: ## Start the development environment
	@echo "Starting development environment..."
	docker compose -f $(COMPOSE_FILE) up -d --build

dev-down: ## Stop the development environment
	@echo "Stopping development environment..."
	docker compose -f $(COMPOSE_FILE) down -v

logs: ## View logs from all services
	docker compose -f $(COMPOSE_FILE) logs -f --tail=100

build: ## Build all services
	docker compose -f $(COMPOSE_FILE) build

clean: ## Clean up containers and volumes
	docker compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f

status: ## Show status of all services
	docker compose -f $(COMPOSE_FILE) ps

restart: ## Restart all services
	docker compose -f $(COMPOSE_FILE) restart

db-migrate: ## Run database migrations (placeholder)
	@echo "Database migrations would run here"

seed: ## Seed the database with sample data (placeholder)
	@echo "Database seeding would run here"
