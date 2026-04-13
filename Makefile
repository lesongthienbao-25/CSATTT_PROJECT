.PHONY: build
build:
	docker compose down
	docker compose up -d
