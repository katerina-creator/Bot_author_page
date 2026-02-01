import Fastify from "fastify";
import healthRoute from "./routes/health.ts";
import { draftsRoutes } from "./routes/drafts.ts";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(healthRoute);
  app.register(draftsRoutes);

  return app;
}