import { FastifyRequest, FastifyReply } from "fastify";
import { RATE_LIMIT_CONFIG } from "../../config/rateLimit.js";
import { logger } from "../../infra/logger/logger.js";

interface RateLimitState {
    count: number;
    resetAt: number;
}

/**
 * Factory to create a rate limiting middleware with scoped state.
 */
export function createRateLimiter() {
    // State is now scoped to this factory instance, not global module state
    const clients = new Map<string, RateLimitState>();

    return async function rateLimitMiddleware(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const now = Date.now();

        // 1. Get Client Key: prefer request.ip, fallback to remoteAddress
        const clientKey = request.ip || request.socket.remoteAddress || "unknown_client";

        // 2. Get state for key
        let state = clients.get(clientKey);

        // 3. Lazy cleanup/Initialization
        if (!state || now > state.resetAt) {
            state = {
                count: 1,
                resetAt: now + RATE_LIMIT_CONFIG.windowMs,
            };
            clients.set(clientKey, state);
        } else {
            // 4. Increment count
            state.count++;
        }

        // 5. Check limit
        if (state.count > RATE_LIMIT_CONFIG.maxRequests) {
            // Log limit hit
            logger.warn(
                {
                    ip: clientKey,
                    requestId: request.id,
                    count: state.count,
                    limit: RATE_LIMIT_CONFIG.maxRequests,
                },
                "Rate limit exceeded"
            );

            // Return 429
            return reply.status(429).send({
                error: {
                    code: "RATE_LIMIT_EXCEEDED",
                    message: "Too many requests",
                },
                requestId: request.id,
            });
        }

        // 6. Continue (implicitly by not returning response)
    };
}
