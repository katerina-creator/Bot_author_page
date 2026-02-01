import { buildApp } from "./app.ts";
import { pingDb } from "./db.ts";

const app = buildApp();

const port = Number(process.env.PORT ?? 3000);

async function start() {
  await pingDb();
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Server is running on port ${port}`);
}

start().catch((err) => {
  console.error("START FAILED:", err);
  if (err instanceof Error) {
    console.error("MESSAGE:", err.message);
    console.error("STACK:", err.stack);
  }
  process.exit(1);
});

