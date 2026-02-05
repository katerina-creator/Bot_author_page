import { randomBytes } from "node:crypto";

/**
 * Generates a cryptographically secure random token for public previews.
 * Format: 32 bytes (64 hex characters).
 * 
 * @returns {string} The collected hex string.
 */
export function generatePreviewToken(): string {
    // 32 bytes = 256 bits of entropy, sufficient for unguessable tokens.
    return randomBytes(32).toString("hex");
}
