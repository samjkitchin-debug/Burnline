# Burnline auth observability

Structured server-side logs for auth flows. Implementation: `src/lib/auth/log.ts`.

Logs are JSON lines prefixed with `[burnline:auth]`. Disabled when `NODE_ENV=test`.

## Events

| Event | When | Payload fields |
|-------|------|----------------|
| `auth_redirect_to_login` | Guard finds no user | `route` (sanitized path) |
| `auth_login_success` | Password sign-in OK | `route` (intended `next`) |
| `auth_login_failed` | Password sign-in error | `reason` (truncated message, no email) |
| `auth_signup_success` | Sign-up OK | `route` |
| `auth_signup_failed` | Sign-up error | `reason` |
| `auth_signup_requires_confirmation` | Sign-up OK but no session (confirm email on) | `route` |
| `login_page_with_auth_cookie` | `/login` hit while already authed | `route`: `has_next` or `default` |
| `onboarding_incomplete_redirect` | App route blocked pending setup | `route` |

## Never log

- Access tokens or refresh tokens
- Cookie values or names
- Email addresses (avoid in v1)
- Passwords
- Financial data (amounts, categories, bill streams)
- Full `FormData` or request bodies

## Local inspection

During `npm run dev`, watch the terminal for `[burnline:auth]` lines when testing [auth smoke test](auth-smoke-test.md).

## Production (later)

- Ship logs to your aggregator (Vercel logs, Datadog, etc.)
- Alert on spikes of `auth_login_failed` (possible abuse)
- Do not enable debug logging that dumps Supabase session objects

## Middleware

Middleware does **not** emit auth redirect events — it only refreshes cookies. If you see `auth_redirect_to_login`, it came from a route guard, not middleware.

## Related

- [Auth session architecture](../architecture/auth-session.md)
