
import escape from "escape-html";

/**
 * Escapes a string for insertion into HTML, replacing characters
 * that have special meaning for HTML interpreters.
 *
 * Wraps the standard 'escape-html' library.
 *
 * @param unsafe - The input value to escape.
 * @returns The escaped string, or an empty string if input is null/undefined.
 */
export function escapeHtml(unsafe: unknown): string {
    if (unsafe === null || unsafe === undefined) {
        return "";
    }
    return escape(String(unsafe));
}
