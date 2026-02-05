
import assert from "node:assert";
import test from "node:test";
import { escapeHtml } from "../services/security/escapeHtml.js";

test("Security: escapeHtml", async (t) => {
    await t.test("should escape basic HTML characters", () => {
        assert.strictEqual(escapeHtml("<"), "&lt;");
        assert.strictEqual(escapeHtml(">"), "&gt;");
        assert.strictEqual(escapeHtml("&"), "&amp;");
        assert.strictEqual(escapeHtml('"'), "&quot;");
        assert.strictEqual(escapeHtml("'"), "&#39;");
    });

    await t.test("should neutralize script tags", () => {
        const input = "<script>alert(1)</script>";
        const expected = "&lt;script&gt;alert(1)&lt;/script&gt;";
        assert.strictEqual(escapeHtml(input), expected);
    });

    await t.test("should escape HTML attributes", () => {
        const input = 'onload="alert(1)"';
        const expected = "onload=&quot;alert(1)&quot;";
        assert.strictEqual(escapeHtml(input), expected);
    });

    await t.test("should handle null and undefined", () => {
        assert.strictEqual(escapeHtml(null), "");
        assert.strictEqual(escapeHtml(undefined), "");
    });

    await t.test("should handle numbers and booleans", () => {
        assert.strictEqual(escapeHtml(123), "123");
        assert.strictEqual(escapeHtml(true), "true");
    });
});
