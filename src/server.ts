import Fastify from "fastify";
import { pingDb } from "./db.js";
import { draftsRoutes } from "./routes/drafts.js";
import "dotenv/config";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.register(draftsRoutes);

const port = Number(process.env.PORT ?? 3000);

async function start() {
  // Проверяем DB на старте — чтобы сразу ловить проблемы с доступом
  await pingDb();

  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Server is running on port ${port}`);
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
