COMPOSE_FILE=docker-compose.yml

.PHONY: build up down logs ps rm

build:
	docker compose -f $(COMPOSE_FILE) build

up:
	docker compose -f $(COMPOSE_FILE) up -d --remove-orphans

down:
	docker compose -f $(COMPOSE_FILE) down

logs:
	docker compose -f $(COMPOSE_FILE) logs -f --tail=200

ps:
	docker compose -f $(COMPOSE_FILE) ps

rm:
	docker compose -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans