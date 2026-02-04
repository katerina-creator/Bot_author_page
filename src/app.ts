import Fastify from "fastify";
import { randomUUID } from "node:crypto";

import { logger } from "./infra/logger/logger.ts";
import healthRoute from "./http/routes/health.ts";
import { draftsRoutes } from "./http/routes/drafts.ts";

export function buildApp() {
  const app = Fastify({
    logger,
    requestIdHeader: "x-request-id",
    genReqId: (req) => {
      const existing = req.headers["x-request-id"];
      return typeof existing === "string" && existing.length > 0 ? existing : randomUUID();
    },
  });

  // Routes
  app.register(healthRoute);
  app.register(draftsRoutes);

  // Global error handler (single JSON format + requestId)
  app.setErrorHandler((error, request, reply) => {
    const status = Number((error as any)?.statusCode || (error as any)?.status || 500);
    const code =
      (error as any)?.code || (status >= 500 ? "internal_error" : "bad_request");
    const message = (error as any)?.message || "Unexpected error";

    const level = status >= 500 ? "error" : "warn";
    (logger as any)[level](
      {
        err: error,
        requestId: request.id,
        status,
        code,
        method: request.method,
        url: request.url,
      },
      "Request failed"
    );

    reply.status(status).send({
      error: { code, message },
      requestId: request.id,
    });
  });

  return app;
}
