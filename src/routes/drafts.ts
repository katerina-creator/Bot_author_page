import type { FastifyInstance } from "fastify";
import { pool } from "../db.js";

/**
 * Временная схема авторизации для MVP-скелета:
 * берём userId из заголовка X-User-Id.
 * Позже заменим на реальную auth-логику (Telegram / JWT / session).
 */
function getUserIdFromHeader(req: any): bigint {
  const raw = req.headers["x-user-id"];
  if (!raw) throw new Error("Missing X-User-Id header");
  const s = Array.isArray(raw) ? raw[0] : String(raw);
  // В БД user_id BIGINT => используем BigInt в Node
  return BigInt(s);
}

export async function draftsRoutes(app: FastifyInstance) {
  // GET /drafts/me
  app.get("/drafts/me", async (req, reply) => {
    let userId: bigint;
    try {
      userId = getUserIdFromHeader(req);
    } catch (e: any) {
      return reply.code(400).send({ error: e.message });
    }

    const { rows } = await pool.query(
      `SELECT id, user_id, lang, status, data, created_at, updated_at
       FROM drafts
       WHERE user_id = $1
       LIMIT 1`,
      [userId.toString()]
    );

    if (rows.length === 0) {
      return reply.code(404).send({ error: "Draft not found" });
    }

    // В ответ возвращаем объект, близкий к контракту (meta + data)
    const d = rows[0];
    return reply.code(200).send({
      meta: {
        draftId: d.id,
        userId: d.user_id,
        lang: d.lang,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      },
      data: d.data,
    });
  });
}
