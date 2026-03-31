default: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | gawk 'match($$0, /(makefile:)?(.*):.*?## (.*)/, a) {printf "\033[36m%-30s\033[0m %s\n", a[2], a[3]}'


install: ## Install all dependencies
	npm install

start: ## Start application in development
	npm run dev

build: ## Build application for production
	npm run build

lint: ## Run linter
	npm run lint
