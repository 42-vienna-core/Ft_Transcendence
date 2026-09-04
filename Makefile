SHELL := /bin/bash

NVM_URL = https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh
NODE_VERSION = 20
LOCAL_IP = $(shell ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[0-9.]+')

ifeq ($(LOCAL_IP),)
	LOCAL_IP = 127.0.0.1
endif

DOMAIN = $(subst .,-,$(LOCAL_IP)).nip.io

all: certs up 

## Generate self-signed TLS certificates for local development
# certs:
# 	mkdir -p nginx/certs
# 	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
# 		-keyout nginx/certs/key.pem \
# 		-out nginx/certs/cert.pem \
# 		-subj "/C=AT/ST=Vienna/L=Vienna/O=Vienna42/CN=${LOCAL_IP}" \
#   		-addext "subjectAltName=IP:${LOCAL_IP}"
# 	chmod 600 nginx/certs/key.pem 
# 	chmod 644 nginx/certs/cert.pem 

certs:
	mkdir -p nginx/certs
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/certs/key.pem \
		-out nginx/certs/cert.pem \
		-subj "/C=AT/ST=Vienna/L=Vienna/O=Vienna42/CN=$(DOMAIN)" \
		-addext "subjectAltName=DNS:$(DOMAIN),IP:$(LOCAL_IP)"
	chmod 600 nginx/certs/key.pem
	chmod 644 nginx/certs/cert.pem


## Copy .env.example to .env if it doesn't exist
env:
	@test -f .env || cp .env.example .env && echo "Created .env from .env.example"

# prepend_adrr:
# 	@touch .env .env.prod
# 	@sed -i '/^DOMAIN_NAME=/d' .env .env.prod
# 	@sed -i '1i DOMAIN_NAME=$(LOCAL_IP)' .env .env.prod

prepend_adrr:
	@touch .env .env.prod
	@sed -i '/^DOMAIN_NAME=/d' .env .env.prod
	@sed -i '1i DOMAIN_NAME=$(DOMAIN)' .env .env.prod

## Install NVM and Node.js if not already installed
setup:
	@echo "Checking for NVM..."
	@if [ -d "$$HOME/.nvm" ]; then \
		echo "NVM directory already exists. Skipping install."; \
		exit 0; \
	else \
		echo "Installing NVM..."; \
		curl -o- $(NVM_URL) | bash; \
	fi
	@echo "Installing NVM..."
	@curl -o- $(NVM_URL) | bash
	@echo "NVM installed. Now configuring environment..."
	@# We must source nvm and install node in the SAME line using ';' or '&&'
	export NVM_DIR="$$HOME/.nvm"; \
	[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
	nvm install $(NODE_VERSION); \
	nvm use $(NODE_VERSION); \
	npm install -g npm@latest

init_modules:
	@echo "Updating node modules..."
	@echo "Note: If you see 'command not found: nvm', make sure to run 'make setup' first to install NVM and Node.js."
	cd ./frontend && npm ci
	cd ./backend && npm ci

## Build and start all services

## Seed admin accounts (reads ADMIN_1_*, ADMIN_2_*, ... from .env/.env.prod)
admin:
	docker compose exec backend npm run seed:admin

## Seed bot accounts (bot1@ai.com, bot2@ai.com, bot3@ai.com)
seed-bots:
	docker compose exec backend npm run seed

up: env prepend_adrr
	docker compose up --build

prod: prepend_adrr
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up --build -d

## Stop all services
down:
	docker compose down

## Stop and remove volumes (wipes database!)
clean:
	docker compose down -v


## Remove everythings
fclean: clean
	# This deletes all unused data (containers, networks, and CACHE)
	docker system prune -f
	# To be even more aggressive (deletes all unused images too)
	docker system prune -a --volumes
	rm -rf frontend/.next
	rm -rf frontend/node_modules/.cache
	npm cache clean --force

## Rebuild everything
re: down up

## Follow logs for all services
logs:
	docker compose logs -f

## Follow logs for a specific service: make log s=backend
log:
	docker compose logs -f $(s)

## Run Prisma migrations inside the backend container
migrate:
	docker exec -it backend npx prisma migrate dev

generate:
	docker exec -it backend npx prisma generate

prisma-reset:
	docker exec -it backend npx prisma migrate reset

## Open Prisma Studio (web-based DB GUI) — runs on port 5555
studio:
	docker exec -it backend npx prisma studio --port 5555

## Open a shell in a service: make shell s=backend
shell:
	docker compose exec $(s) sh

update-backend:
	docker compose build --no-cache backend
	docker compose up -d --force-recreate backend
	docker container prune -f

update-frontend:
	docker compose build --no-cache frontend
	docker compose up -d --force-recreate frontend
	docker container prune -f

.PHONY: all up down logs certs migrate prisma-reset studio clean re admin seed-bots