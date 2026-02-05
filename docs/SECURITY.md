# Rendering Security

This application renders user-provided content in web previews. To prevent Cross-Site Scripting (XSS) and other injection attacks, strict output encoding and abuse prevention measures are enforced.

## Token Security
- **Type**: Cryptographically strong random tokens (32 bytes / 64 hex chars).
- **Rotation**: Tokens are generated on creation and can be rotated by the user via `POST /drafts/me/preview-token`.
- **Invalidation**: Rotating a token immediately invalidates the old link (returns 404).

## Abuse Prevention
- **Rate Limiting**: Enforced on sensitive endpoints including public previews.
    - Default: 100 requests / 15 minutes.
    - Configurable via `RATE_LIMIT` env vars.
- **Error Handling**: Public endpoints return generic HTML 404/500 pages to avoid leaking internal details.

## Implementation

All rendering logic MUST use the centralized escaping helper:

- **Path**: `src/services/security/escapeHtml.ts`
- **Function**: `escapeHtml(value: unknown): string`

This helper wraps the industry-standard [escape-html](https://www.npmjs.com/package/escape-html) library.

## Protected Paths

1.  **Draft Preview**: `GET /p/:token`
    - **Authentication**: Token-based (capability URL).
    - **Rendering**: user-provided content is strictly escaped.
    - **Headers**:
        - `Content-Security-Policy`: `default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: https:;`
        - `X-Content-Type-Options`: `nosniff`
        - `X-Frame-Options`: `DENY`
    - **Error Handling**: Returns generic HTML 404 pages to prevent information leakage.
    - **Formatting**: Renders user drafts (About, Experience, Skills) with safe HTML templates.

## Testing

Security tests are located in `src/tests/security.test.ts`.
Run tests with:
```bash
npx tsx src/tests/security.test.ts
```
