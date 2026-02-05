
import assert from "node:assert";
import test from "node:test";
import { generatePreviewToken } from "../services/security/token.js";

test("Security: Token Generation", async (t) => {
    await t.test("should generate tokens of correct length and format", () => {
        const token = generatePreviewToken();
        assert.strictEqual(typeof token, "string");
        // 32 bytes hex = 64 characters
        assert.strictEqual(token.length, 64);
        // Should be valid hex
        assert.match(token, /^[0-9a-f]{64}$/);
    });

    await t.test("should generate unique tokens", () => {
        const tokens = new Set<string>();
        for (let i = 0; i < 1000; i++) {
            tokens.add(generatePreviewToken());
        }
        // Very highly likely to be 1000 uniques. If this fails, randomBytes is broken.
        assert.strictEqual(tokens.size, 1000);
    });
});
