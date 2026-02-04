import { env } from "process";

/**
 * Safely parses a positive integer from an environment variable.
 * Returns the fallback if the value is missing, not a number, or <= 0.
 */
function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const RATE_LIMIT_CONFIG = {
  windowMs: parsePositiveInt(env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes default
  maxRequests: parsePositiveInt(env.RATE_LIMIT_MAX_REQUESTS, 100),      // 100 requests default
};
