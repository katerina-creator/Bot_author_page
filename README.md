# Bot_author_page — Backend (MVP)

Минимальный backend для Telegram-бота, который хранит **один активный Draft** пользователя как единый JSON (JSONB в PostgreSQL).

## Что уже есть
- PostgreSQL в Docker (локально)
- Таблица `drafts` (JSONB)
- GitHub репозиторий + базовая документация

## Цель текущего шага
Добавить **скелет backend-сервиса** (Fastify + TypeScript + pg) для дальнейшей реализации CRUD эндпоинтов:
- GET `/drafts/me`
- POST `/drafts`
- PATCH `/drafts/me`

> `docker-compose.yml` считается локальной инфраструктурой и не хранится в репозитории.

## Быстрый старт

### 1) Установить зависимости
```bash
npm install
```

### 2) Создать `.env` по примеру
Скопируй `.env.example` → `.env` и при необходимости поменяй значения.

### 3) Запустить сервер
```bash
npm run dev
```

Сервер стартует на `http://localhost:3000`

## Проверка
```bash
curl http://localhost:3000/health
```
Ожидается `{"status":"ok"}`

## Структура
```
src/
  db.ts
  server.ts
  routes/
    drafts.ts
migrations/
  001_create_drafts.sql
```
