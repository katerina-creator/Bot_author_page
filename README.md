# Bot_author_page — Backend (MVP)

Backend-сервис для Telegram-бота / клиента, предназначенный для хранения и управления **одним активным Draft на пользователя**
в виде единого JSON-документа (**JSONB в PostgreSQL**).

Проект реализован как **backend-only MVP** с фокусом на:
- строгую слоистую архитектуру (без “дублирующих” папок с одинаковой ролью),
- безопасную работу с окружением и секретами,
- предсказуемое логирование и обработку ошибок,
- расширяемость под Telegram Bot API и дальнейшие сценарии (preview/zip/export и т.д.).

---

## Стек

- **Node.js + TypeScript (ESM)**
- **Fastify** (HTTP API)
- **PostgreSQL** (Docker для локальной инфраструктуры)
- **SQL migrations** (ручные .sql миграции)
- **Pino structured logging**
  - request id корреляция (`x-request-id`)
  - единый формат ошибок + логирование

---

## Схема взаимодействия

```
Client / Bot / Browser
        |
        | HTTP (localhost:3000)
        v
Fastify API (Node.js)
        |
        | SQL (localhost:5432)
        v
PostgreSQL (Docker container)
        |
        v
Database volume (persistent storage)
```

---

## Быстрый старт (dev)

### 1) Переменные окружения

Создай файл `.env` (не коммитится) по примеру `.env.example`.

Минимально нужно:
- порт сервера
- параметры подключения к PostgreSQL
- уровень логирования

### 2) Поднять PostgreSQL (локально)

Используется `docker-compose.local.yml` (не коммитится или лежит локально как infra-файл).
Запусти контейнер Postgres привычным способом для твоего окружения.

### 3) Применить миграции

Миграции лежат в `migrations/` и применяются к БД SQL-скриптами (по порядку).
Например, через любой SQL-клиент или через `psql`.

### 4) Запуск сервера

```bash
npm run dev
```

Сервер доступен по адресу:

```
http://localhost:3000
```

---

## Проверка работоспособности

### Healthcheck

```bash
curl http://localhost:3000/health
```

Ожидаемый ответ:

```json
{ "status": "ok" }
```

---

## API (MVP)

> Реальные пути могут отличаться в зависимости от префикса регистрации роутов.
> Смотри `src/http/routes/*`.

- `GET /health` — healthcheck
- `Drafts` — CRUD для черновиков и работа с активным draft пользователя (MVP)

---

## Логирование и мониторинг (KAN-25)

Реализованы структурные логи и корреляция ошибок:

- **requestId**: поддерживается заголовок `x-request-id`
  - если заголовок не передан — генерируется автоматически
- ошибки возвращаются в едином JSON-формате и содержат `requestId`
- ошибки и запросы логируются через единый logger (Pino)

---

## База данных

### Таблица `drafts`

Draft хранится как единый JSON-документ в поле `data` (JSONB).

Ключевые идеи:
- **один активный draft на пользователя** (ограничение на уровне БД)
- временные поля `created_at`, `updated_at`
- индексы для производительности (например, по `updated_at`)

Миграции: см. `migrations/`.

---

## Каноническая структура проекта (строго)

> В этом проекте запрещено плодить папки с одинаковым смыслом (`utils`, `helpers`, `common`, и т.п.).
> Всё новое кладём только в соответствующий слой ниже.

```
src/
  app.ts                     # сборка Fastify-приложения (plugins/middlewares/routes)
  server.ts                  # точка входа (start/listen)

  config/                    # конфигурация и env (без секретов в репозитории)

  infra/                     # инфраструктура (внешние системы)
    db/
      pool.ts                # подключение к PostgreSQL / пул
    logger/
      logger.ts              # единый logger (pino)

  http/                      # HTTP слой (Fastify routes + middlewares/hooks)
    routes/
      health.ts
      drafts.ts
    middlewares/
      requestLogger.ts       # request logging + requestId
      errorHandler.ts        # единая обработка ошибок (JSON + лог)

  domain/                    # бизнес-сущности/инварианты/схемы
    draft/
      draft.schema.ts
      (прочие доменные файлы)

  services/                  # use-cases / сценарии (транзакции, orchestration)

  repositories/              # доступ к данным (SQL), маппинг к домену
```

---

## Правила безопасности

- `.env` **не коммитится**
- локальные infra-файлы (например, `docker-compose.local.yml`) **не коммитятся**
- секреты не хранятся в репозитории
- все логи и ответы **не должны** содержать “сырой” токен (если появится preview/token — логируем только hash/id)

---

## Roadmap (кратко)

- Telegram-часть:
  - подключение Telegram Bot API
  - маппинг `telegram_user_id → user_id`
  - хранение состояния диалога через `drafts`

- Backend:
  - сервисный слой (use-cases) + транзакции при обновлении draft
  - rate limiting для preview/zip
  - публичный preview endpoint (`/p/:token`)
  - экспорт ZIP/preview rendering

- Инфра:
  - production compose
  - CI (lint + test)
  - расширение README (операционные команды, миграции, troubleshooting)

---

## Примечание

Проект намеренно **не использует** ORM и “тяжёлые” фреймворки на этапе MVP.
Архитектура строится от простого к сложному, с контролем безопасности и технического долга.
