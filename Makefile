# Project Makefile

# Environment and Configuration
ifneq (,$(wildcard backend/.env.local))
	include backend/.env.local
	export
endif

# Database Settings
DB_USER     ?= $(or $(DB_USER),postgres)
DB_PASSWORD ?= $(or $(DB_PASSWORD),postgres)
DB_HOST     ?= $(or $(DB_HOST),localhost)
DB_PORT     ?= $(or $(DB_PORT),5432)
DB_NAME     ?= $(or $(DB_NAME),database_name)

# Tool Configuration
POETRY_RUN = poetry -c backend run
RUFF = poetry -C backend run ruff
PRECOMMIT = poetry -C backend run pre-commit
PYTHON = poetry -C backend run python
MANAGE = $(PYTHON) backend/manage.py
# Docker Settings
DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_FILE = deployment/docker-compose.yml

# Database Commands
createdb:
	@chmod +x backend/managedb.sh
	backend/managedb.sh create

dropdb:
	@chmod +x backend/managedb.sh
	backend/managedb.sh drop

migrations:
	$(MANAGE) makemigrations

migrate:
	$(MANAGE) migrate

# Development Server
run:
	$(MANAGE) runserver

shell:
	$(MANAGE) shell

collectstatic:
	$(MANAGE) collectstatic

# User Management
superuser:
	$(MANAGE) createsuperuser

# Testing and Code Quality
test:
	$(MANAGE) test

lint:
	$(RUFF) ruff check .

format:
	$(RUFF) ruff format .

pre-commit:
	$(PRECOMMIT) run --all-files

# Dependency Management
install:
	cd backend && poetry install
	@if [ ! -f backend/.env.local ]; then \
		echo "Creating .env.local file from .env.template"; \
		cp backend/.env.template backend/.env.local; \
	fi

update:
	cd backend && poetry update

# Database Utilities
psql:
	PGPASSWORD="$(DB_PASSWORD)" psql -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d $(DB_NAME)

backup:
	@mkdir -p backups
	PGPASSWORD="$(DB_PASSWORD)" pg_dump -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) \
		-F c $(DB_NAME) > backups/$(DB_NAME)_`date +%Y%m%d_%H%M%S`.dump

restore:
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Usage: make restore BACKUP_FILE=backups/filename.dump"; \
		exit 1; \
	fi
	PGPASSWORD="$(DB_PASSWORD)" pg_restore -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) \
		-d $(DB_NAME) --clean $(BACKUP_FILE)

# Docker Commands
docker-build:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build

docker-up:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up

docker-down:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

docker-logs:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f

docker-backend-shell:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec backend bash

docker-frontend-shell:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec frontend sh

docker-migrate:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec backend $(PYTHON) manage.py migrate

docker-makemigrations:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec backend $(PYTHON) manage.py makemigrations

docker-superuser:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec backend $(PYTHON) manage.py createsuperuser

docker-test:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec backend $(PYTHON) manage.py test

install-deps:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec -it backend poetry export --without-hashes --output requirements.txt
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec -it backend pip install -r requirements.txt


docker-clean:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f

docker-rebuild:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up

# Cleanup
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name "*.egg" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +

.PHONY: createdb dropdb migrations migrate run shell superuser test lint format pre-commit \
	install update psql backup restore clean docker-build docker-up docker-down docker-logs \
	docker-shell docker-migrate docker-makemigrations docker-superuser docker-test \
	docker-clean docker-rebuild
