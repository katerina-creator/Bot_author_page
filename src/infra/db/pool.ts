import { Pool } from "pg";
import "dotenv/config";

function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const pool = new Pool({
  host: mustGet("DB_HOST"),
  port: Number(mustGet("DB_PORT")),
  database: mustGet("DB_NAME"),
  user: mustGet("DB_USER"),
  password: mustGet("DB_PASSWORD"),
});

export async function pingDb(): Promise<void> {
  const res = await pool.query("SELECT 1 as ok");
  if (res.rows?.[0]?.ok !== 1) throw new Error("DB ping failed");
}
