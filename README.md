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


---

## Дополнения: Security, Preview и Publish (актуально)

### Public Preview (`/p/:token`)
- Публичный preview доступен по одноразовому `preview_token`
- Все пользовательские данные **строго экранируются (XSS-safe rendering)**
- Включены security headers:
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
- На endpoint включён rate limiting (защита от abuse)

### Preview Token
- Генерируется криптографически стойким способом
- Создаётся при `POST /drafts/me`
- Может быть перевыпущен вручную: `POST /drafts/me/preview-token`
- **Автоматически ротируется при publish**
- Старые токены становятся невалидны

---

## Publish & Versioning (KAN-9)

### Version snapshots
При `POST /drafts/me/publish`:
- создаётся **immutable snapshot** текущего draft
- snapshot сохраняется в таблицу `draft_versions`
- `version_number` инкрементируется **per draft**
- `draft.data` **не мутируется**
- операция выполняется атомарно (transaction)

### Таблица `draft_versions`
- `id` UUID
- `draft_id` UUID
- `user_id` BIGINT
- `version_number` INT
- `data` JSONB (snapshot)
- `created_at` TIMESTAMPTZ

Ограничения:
- `UNIQUE (draft_id, version_number)`
- индексы по `draft_id`, `user_id`

Snapshots являются **insert-only** и не имеют путей обновления или удаления.

---

## Команды запуска (актуально)

### Backend
```bash
npm install
npm run dev
```

### PostgreSQL (локально)
```bash
docker compose -f docker-compose.local.yml up -d
```

### Проверка
```bash
curl http://localhost:3000/health
```

Ожидаемый ответ:
```json
{ "status": "ok" }
```

---

## Текущий статус MVP (факт)

Готово:
- Draft CRUD (один активный draft)
- Строгая JSON-валидация (DraftSchema)
- XSS-safe preview rendering
- Public preview `/p/:token`
- Rate limiting для публичных endpoint
- Preview token rotation
- Publish без мутации draft JSON
- Immutable version snapshots (KAN-9)

---

## Чек-лист перед переходом в новый чат

- README дополнён и закоммичен
- Миграция `draft_versions` применена
- `POST /drafts/me/publish` проверен
- Preview по старому токену не работает
- Нет незакоммиченных infra-файлов
- `.env` и `docker-compose.local.yml` не в git

Рекомендуемый следующий шаг:
**Public preview rendering из version snapshot**
