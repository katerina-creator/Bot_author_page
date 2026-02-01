# Bot_author_page — Backend (MVP)

Backend-сервис для Telegram-бота, предназначенный для хранения и управления **одним активным Draft пользователя**
в виде единого JSON-документа (JSONB в PostgreSQL).

Проект реализован как **backend-only MVP** с фокусом на архитектуру, чистоту окружения и дальнейшее масштабирование.

---

## Архитектура и окружение

Проект состоит из двух независимых частей:

- **Node.js backend** — API-сервер (Fastify + TypeScript, ESM)
- **PostgreSQL** — база данных, запущенная в Docker

### Разделение ответственности

- **Node.js**
  - обрабатывает HTTP-запросы
  - содержит бизнес-логику
  - выполняет запросы к базе данных

- **Docker**
  - используется только для инфраструктуры
  - запускает PostgreSQL в изолированном окружении
  - хранит данные в volume

> Docker-конфигурация и секреты считаются локальной инфраструктурой  
> и **не хранятся в репозитории**.

---

## Схема взаимодействия

```
Browser / Bot / Client
        |
        | HTTP (localhost:3000)
        v
Node.js process (Fastify API)
        |
        | SQL (localhost:5432)
        v
PostgreSQL (Docker container)
        |
        v
Database volume (persistent storage)
```

---

## Текущий статус

### Реализовано

- PostgreSQL 16 в Docker
- Подключение к БД через `pg`
- Backend-скелет на Fastify + TypeScript
- Healthcheck endpoint: `GET /health`
- Осознанный выбор **ESM-режима**
- Чистое разделение:
  - код — в репозитории
  - инфраструктура и секреты — вне репозитория

---

## Запуск в режиме разработки

```bash
npm run dev
```

Запускается Node.js процесс в watch-режиме.  
Процесс остаётся активным и автоматически перезапускается при изменениях файлов.

Сервер доступен по адресу:

```
http://localhost:3000
```

---

## Проверка работоспособности

```bash
curl http://localhost:3000/health
```

Ожидаемый ответ:

```json
{ "status": "ok" }
```

---

## Структура проекта

```
src/
  app.ts        # сборка Fastify-приложения
  server.ts     # точка входа
  db.ts         # подключение к PostgreSQL
  routes/
    health.ts
migrations/
package.json
tsconfig.json
README.md
```

---

## Следующие шаги

- первая SQL-миграция `drafts`
- таблица `drafts` (JSONB)
- эндпоинт `GET /drafts/me`
- базовый CRUD для Draft

---

## Примечание

Проект намеренно не использует фреймворки верхнего уровня  
(Spring / Nest / ORM) на этапе MVP — архитектура строится от простого к сложному.
