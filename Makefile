COMPOSE_FILE=docker-compose.yml

.PHONY: build up down logs ps rm

build:
	docker-compose build

up:
	docker-compose up -d --remove-orphans

down:
	docker-compose down --remove-orphans

logs:
	docker-compose logs -f --tail=200

ps:
	docker-compose ps

rm:
	docker-compose down --rmi all --volumes --remove-orphans

.PHONY: console
console:
	docker-compose run --rm -e MONGO_URL='mongodb://mongo:27017/neurowell' -e JWT_SECRET='${JWT_SECRET}' backend node console.js

b_fe:
	docker-compose build frontend

