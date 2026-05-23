# Logging redaction

Burnline must not leak personal financial data or credentials into application logs, Vercel logs, or browser consoles in production.

Aligned with ISO/IEC 27001-style operations discipline and ISO/IEC 27701-style data-handling care. **Not a certification claim.**

## Never log

| Category | Examples |
|----------|----------|
| Credentials | Access tokens, refresh tokens, session JWTs, cookies, passwords |
| Keys | Anon key values, service role key, database passwords |
| Identity (avoid) | Email addresses, `auth.uid()` UUIDs (unless strictly necessary for server-side incident response) |
| Financial amounts | Income, savings, spend, bill payment, estimates (cents or dollars) |
| Financial labels | Bill stream names, categories tied to a user |
| Free text | Bill payment notes, manual spend notes |
| Tax/debt context | User-entered names like “ATO”, “HECS”, “Mortgage” |
| Raw payloads | Full `FormData`, request bodies, Supabase row dumps |
| Supabase sessions | `session`, `user` objects from Auth responses |

## Allowed logs (v1)

| Field | Example |
|-------|---------|
| Event name | `auth_login_success` |
| Route / path | `/today`, `has_next` (sanitised) |
| Auth state | `authenticated: true` (boolean), not user id in client-visible logs |
| Error class | `reason: "missing_fields"` (truncated, non-PII) |
| Timing | Duration ms, status code |
| Environment | `NODE_ENV` |

Implementation: `src/lib/auth/log.ts` — `authLog()` only; skipped in `NODE_ENV=test`.

## Good vs bad examples

### Good

```json
{"event":"auth_login_success","ts":"2026-05-23T10:00:00.000Z","route":"/today"}
```

```json
{"event":"auth_login_failed","reason":"Invalid login credentials"}
```

Use generic `reason` codes where possible instead of raw Supabase messages in production (v1 may pass truncated message — avoid upgrading to full PII).

### Bad

```json
{"email":"user@example.com","income":1000000}
```

```json
{"note":"Paid landlord John","amount_cents":490000}
```

```javascript
console.log(formData);
console.log(session);
```

## Server actions and errors

- Return **user-safe** error strings to the UI; do not echo raw Postgres rows.
- Do not `console.log` in budget server actions (current codebase: compliant).
- Redirect errors use encoded messages; avoid putting amounts in query strings.

## Client-side

- No financial analytics SDKs in v1.
- Avoid `console.log` of spend form state in production builds.

## Operators (Supabase / Vercel)

- Supabase dashboard and Postgres logs may contain query data — restrict dashboard access.
- Treat production logs as **Confidential** at minimum.

## Review cadence

- Before adding any logger or error reporter: check against this doc.
- Before adding PostHog/Sentry: [security roadmap](security-roadmap.md) privacy review.
