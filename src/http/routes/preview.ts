import type { FastifyInstance } from "fastify";
import { pool } from "../../infra/db/pool.js";
import { createRateLimiter } from "../middlewares/rateLimiter.js";

import { escapeHtml } from "../../services/security/escapeHtml.js";

function renderHtml(draftData: any): string {
  const { content } = draftData || {};
  const about = content?.about || {};
  const experience = Array.isArray(content?.experience) ? content.experience : [];
  const skills = Array.isArray(content?.skills) ? content.skills : [];

  const name = about.fullName || about.name || "Anonymous";
  const bio = about.bio || about.description || "";

  let html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(name)} - Preview</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.5; color: #333; }
    h1, h2, h3 { color: #111; }
    section { margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
    .exp-item, .skill-list { margin-bottom: 1rem; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(name)}</h1>
    <p>${escapeHtml(bio)}</p>
  </header>
`;

  if (experience.length > 0) {
    html += `
  <section>
    <h2>Experience</h2>
    ${experience.map((exp: any) => `
      <div class="exp-item">
        <h3>${escapeHtml(exp.title || exp.position || "Role")}</h3>
        <p><strong>${escapeHtml(exp.company || "")}</strong> | ${escapeHtml(exp.period || exp.date || "")}</p>
        <p>${escapeHtml(exp.description || "")}</p>
      </div>
    `).join("")}
  </section>`;
  }

  if (skills.length > 0) {
    html += `
  <section>
    <h2>Skills</h2>
    <ul>
      ${skills.map((skill: any) => `<li>${escapeHtml(skill.name || skill)}</li>`).join("")}
    </ul>
  </section>`;
  }

  html += `
</body>
</html>`;

  return html;
}

export async function previewRoutes(app: FastifyInstance) {
  const rateLimiter = createRateLimiter();

  app.get("/p/:token", { preHandler: rateLimiter }, async (request, reply) => {
    const { token } = request.params as { token: string };

    if (!token) {
      return reply
        .code(404)
        .header("Content-Type", "text/html; charset=utf-8")
        .send("<!doctype html><html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>");
    }

    const { rows } = await pool.query(
      `SELECT data
       FROM drafts
       WHERE preview_token = $1 AND is_active = true
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return reply
        .code(404)
        .header("Content-Type", "text/html; charset=utf-8")
        .send("<!doctype html><html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>");
    }

    const draftData = rows[0].data;
    const html = renderHtml(draftData);

    return reply
      .code(200)
      .header("Content-Type", "text/html; charset=utf-8")
      // Security Headers
      .header(
        "Content-Security-Policy",
        "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: https:;"
      )
      .header("X-Content-Type-Options", "nosniff")
      .header("X-Frame-Options", "DENY")
      .header("Referrer-Policy", "no-referrer")
      .send(html);
  });
}
