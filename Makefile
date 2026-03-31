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

typecheck: ## Run TypeScript type checker
	npm run typecheck

format-check: ## Check formatting with Prettier
	npm run format:check

test: test-unit test-e2e ## Run all tests (unit + e2e)

test-unit: ## Run unit and component tests
	npm run test

test-watch: ## Run unit and component tests in watch mode
	npm run test:watch

test-e2e: ## Run e2e tests (requires running dev server or starts one automatically)
	npm run test:e2e

test-e2e-ui: ## Run e2e tests with Playwright UI
	npm run test:e2e:ui
