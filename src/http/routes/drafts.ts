import type { FastifyInstance } from "fastify";
import { pool } from "../../infra/db/pool.js";
import { DraftSchema } from "../../domain/draft/draft.schema.js";
import { generatePreviewToken } from "../../services/security/token.js";

/**
 * draftsRoutes — API слой для работы с Draft (KAN-8).
 *
 * Реализовано в этом файле (подзадачи KAN-31..KAN-34):
 *   - KAN-31: GET  /drafts/me  — получить активный Draft
 *   - KAN-32: POST /drafts/me  — создать Draft (create-only)
 *   - KAN-33: PUT  /drafts/me  — обновить Draft целиком (update-only)
 *   - KAN-34: Validate Draft JSON — серверная валидация по DraftSchema (внутренняя логика)
 *
 * Ключевые архитектурные правила (MVP):
 * 1) Draft хранится целиком в JSONB колонке `data`.
 *    Формат соответствует Draft JSON Contract: { meta, content, presentation }.
 * 2) Один активный Draft на пользователя — используем is_active = true.
 *    (В БД это обеспечено partial UNIQUE index по user_id WHERE is_active = true.)
 * 3) Сервер НЕ делает частичные апдейты секций. Только full replace (PUT).
 * 4) Сервер валидирует Draft JSON, но НЕ "чинит" и не дополняет документ.
 *    Draft JSON остаётся single source of truth.
 */

/**
 * Временная схема авторизации для MVP:
 * берём userId из заголовка X-User-Id.
 * Позже заменим на реальную auth-логику (Telegram / JWT / session).
 */
function getUserIdFromHeader(req: any): bigint {
  // Заголовки в Node могут приходить как string | string[] | undefined.
  const raw = req.headers["x-user-id"];
  if (!raw) throw new Error("Missing X-User-Id header");

  // Нормализуем в строку.
  const s = Array.isArray(raw) ? raw[0] : String(raw);

  // В БД user_id BIGINT, поэтому в Node используем BigInt.
  // Валидация: разрешаем только целое положительное число.
  if (!/^\d+$/.test(s)) throw new Error("Invalid X-User-Id header");

  return BigInt(s);
}

/**
 * Единый формат ошибки (MVP).
 * Дальше это можно будет перенести в глобальный error-handler.
 */
function sendError(
  reply: any,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return reply.code(status).send({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

/**
 * KAN-34: Validate Draft JSON
 *
 * - Валидируем payload строго по DraftSchema (MVP Draft JSON Contract).
 * - Проверяем инвариант владения: meta.userId должен совпадать с auth user_id.
 *   Это не бизнес-логика, а базовая защита от подмены владельца.
 */
function validateDraftPayload(
  reply: any,
  authUserId: bigint,
  body: unknown
): { ok: true; draft: any } | { ok: false } {
  const parsed = DraftSchema.safeParse(body);
  if (!parsed.success) {
    sendError(reply, 400, "VALIDATION_ERROR", "Invalid Draft JSON", parsed.error.format());
    return { ok: false };
  }

  // В контракте meta.userId — строка (telegram_user_id). Сравниваем по строковому виду.
  const authUserIdStr = authUserId.toString();
  if (parsed.data.meta.userId !== authUserIdStr) {
    sendError(
      reply,
      403,
      "FORBIDDEN_DRAFT_OWNER_MISMATCH",
      "Draft meta.userId must match authenticated user_id"
    );
    return { ok: false };
  }

  return { ok: true, draft: parsed.data };
}

export async function draftsRoutes(app: FastifyInstance) {
  /**
   * KAN-31: GET /drafts/me
   *
   * Поведение:
   * - 401: если нет/невалидный X-User-Id
   * - 404: если активный Draft не найден
   * - 200: возвращаем Draft JSON целиком (из columns `data`)
   */
  app.get("/drafts/me", async (req, reply) => {
    // 1) Получаем user_id из "временной авторизации".
    //    Это НЕ бизнес-логика, а технический MVP-адаптер до реальной auth.
    let userId: bigint;
    try {
      userId = getUserIdFromHeader(req);
    } catch (e: any) {
      // Пока нет полноценной auth — отсутствие/невалидность user_id считаем 401.
      return sendError(reply, 401, "UNAUTHORIZED", e?.message ?? "Unauthorized");
    }

    // 2) Читаем активный Draft из БД.
    //    Важно: фильтруем is_active = true.
    //    В JSONB-колонке `data` хранится весь документ.
    const { rows } = await pool.query(
      `SELECT data
       FROM drafts
       WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
      // pg лучше передавать BIGINT как строку (избег trades с JS number).
      [userId.toString()]
    );

    // 3) Нет активного draft => 404.
    if (rows.length === 0) {
      return sendError(reply, 404, "DRAFT_NOT_FOUND", "Active draft not found");
    }

    // 4) Успех: отдаём Draft JSON целиком.
    //    Никаких преобразований: Draft JSON = single source of truth.
    return reply.code(200).send(rows[0].data);
  });

  /**
   * KAN-32: POST /drafts/me (create-only)
   *
   * Поведение:
   * - 401: если нет/невалидный X-User-Id
   * - 400: если Draft JSON не проходит валидацию DraftSchema
   * - 403: если meta.userId != auth user_id
   * - 409: если активный Draft уже существует
   * - 201: Draft создан, возвращаем Draft JSON целиком
   */
  app.post("/drafts/me", async (req, reply) => {
    // 1) auth user_id
    let userId: bigint;
    try {
      userId = getUserIdFromHeader(req);
    } catch (e: any) {
      return sendError(reply, 401, "UNAUTHORIZED", e?.message ?? "Unauthorized");
    }

    // 2) KAN-34: validate
    const validated = validateDraftPayload(reply, userId, (req as any).body);
    if (!validated.ok) return;

    // 3) create-only: если активный draft есть — 409
    const existing = await pool.query(
      `SELECT 1
       FROM drafts
       WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
      [userId.toString()]
    );
    if (existing.rows.length > 0) {
      return sendError(reply, 409, "DRAFT_ALREADY_EXISTS", "Active draft already exists");
    }

    // 4) INSERT активного draft
    //    updated_at выставляется автоматически (DEFAULT/trigger), вручную не трогаем.
    try {
      const { rows } = await pool.query(
        `INSERT INTO drafts (user_id, is_active, data, preview_token)
         VALUES ($1, true, $2::jsonb, $3)
         RETURNING data, preview_token`,
        [userId.toString(), JSON.stringify(validated.draft), generatePreviewToken()]
      );

      return reply.code(201).send({ ...rows[0].data, preview_token: rows[0].preview_token });
    } catch (e: any) {
      // Если вдруг сработал unique index (гонка) — тоже 409.
      // pg error code 23505 = unique_violation
      if (e?.code === "23505") {
        return sendError(reply, 409, "DRAFT_ALREADY_EXISTS", "Active draft already exists");
      }
      throw e;
    }
  });

  /**
   * KAN-33: PUT /drafts/me (update-only)
   *
   * Поведение:
   * - 401: если нет/невалидный X-User-Id
   * - 400: если Draft JSON не проходит DraftSchema
   * - 403: если meta.userId != auth user_id
   * - 404: если активного Draft нет
   * - 200: Draft обновлён целиком (full replace)
   *
   * Идемпотентность:
   * - повторный PUT с тем же JSON не должен менять состояние (кроме updated_at в БД —
   *   зависит от триггера/реализации; для MVP это допустимо).
   */
  app.put("/drafts/me", async (req, reply) => {
    // 1) auth user_id
    let userId: bigint;
    try {
      userId = getUserIdFromHeader(req);
    } catch (e: any) {
      return sendError(reply, 401, "UNAUTHORIZED", e?.message ?? "Unauthorized");
    }

    // 2) KAN-34: validate
    const validated = validateDraftPayload(reply, userId, (req as any).body);
    if (!validated.ok) return;

    // 3) update-only: если нет активного draft — 404
    const { rows } = await pool.query(
      `UPDATE drafts
       SET data = $2::jsonb
       WHERE user_id = $1 AND is_active = true
       RETURNING data`,
      [userId.toString(), JSON.stringify(validated.draft)]
    );

    if (rows.length === 0) {
      return sendError(reply, 404, "DRAFT_NOT_FOUND", "Active draft not found");
    }

    return reply.code(200).send(rows[0].data);
  });

  /**
   * POST /drafts/me/preview-token (Action)
   * Re-generate preview token (invalidate old one).
   */
  app.post("/drafts/me/preview-token", async (req, reply) => {
    let userId: bigint;
    try {
      userId = getUserIdFromHeader(req);
    } catch (e: any) {
      return sendError(reply, 401, "UNAUTHORIZED", e?.message ?? "Unauthorized");
    }

    const newToken = generatePreviewToken();

    const { rows } = await pool.query(
      `UPDATE drafts
       SET preview_token = $2
       WHERE user_id = $1 AND is_active = true
       RETURNING preview_token`,
      [userId.toString(), newToken]
    );

    if (rows.length === 0) {
      return sendError(reply, 404, "DRAFT_NOT_FOUND", "Active draft not found");
    }

    return reply.code(200).send({ preview_token: rows[0].preview_token });
  });

  /**
   * POST /drafts/me/publish (Action)
   * Publish the current draft.
   * - Rotates the preview_token (invalidation).
   * - Updates updated_at.
   * - Server does NOT mutate draft.data JSON (KAN-17 rule).
   */
  app.post("/drafts/me/publish", async (req, reply) => {
    let userId: bigint;
    try {
      userId = getUserIdFromHeader(req);
    } catch (e: any) {
      return sendError(reply, 401, "UNAUTHORIZED", e?.message ?? "Unauthorized");
    }

    const newToken = generatePreviewToken();

    // Updates preview_token (invalidate old link) and timestamp.
    const { rows } = await pool.query(
      `UPDATE drafts
       SET preview_token = $2, updated_at = now()
       WHERE user_id = $1 AND is_active = true
       RETURNING preview_token`,
      [userId.toString(), newToken]
    );

    if (rows.length === 0) {
      return sendError(reply, 404, "DRAFT_NOT_FOUND", "Active draft not found");
    }

    return reply.code(200).send({ preview_token: rows[0].preview_token });
  });
}
