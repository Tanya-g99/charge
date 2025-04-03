# Makefile

VITE = npx vite
VITE_BUILD = npx vite build

# Определяем окружение по умолчанию (development)
ENV ?= development

# Команда для запуска проекта в режиме разработки
dev:
	@echo "Запуск проекта в режиме разработки..."
	$(VITE) --mode development

# Команда для создания продакшн-сборки
build:
	@echo "Создание сборки для продакшн..."
	$(VITE_BUILD) --mode production

# Команда для старта сервера в продакшн-режиме
serve:
	@echo "Запуск проекта в продакшн-режиме..."
	VITE_ENV=production $(VITE) preview

.PHONY: dev build serve
