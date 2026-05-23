# Burnline auth and session architecture

Auth friction is product failure. Users must open Burnline and log spends without surprise login bounces.

## Doctrine

| Rule | Implementation |
|------|----------------|
| Cookie refresh temporarily disabled | Root `middleware.ts` removed — `@supabase/ssr` crashed at module load on Vercel (`__dirname is not defined`). Reintroduce via `src/proxy.ts` in a separate pass. |
| Server auth helper is source of truth | `getServerUserId()` in `src/lib/auth/server.ts` uses `getUser()` only |
| Route guards own protected redirects | `guardAuthenticatedAppRoute()` / `guardOnboardingPage()` in `src/lib/auth/guard.ts` |
| Client components never decide access | No `getSession()` in client; no auth probes on mount/focus/visibility |
| Login is final fallback, not recovery | Do not scatter login redirects; use guards + `/login?next=` |
| Every forced login preserves `next` | `loginPath()` + `sanitizeNext()` |
| No passive `getSession` probes | Not on mount, focus, visibilitychange, or online |
| No random `router.refresh()` for auth | Server actions + `router.push` after mutations |
| Bounded refresh after user save | `TodayAddSpend` calls `router.refresh()` once after a successful Add spend from the sheet — not passive auth probing |
| No service role in app code | Anon key + user JWT only |
| No secrets in logs | See `src/lib/auth/log.ts` |
| No financial data in auth logs | Route paths only, no amounts |

### Production posture (temporary)

- **No root middleware or proxy** — cookie refresh is off until `src/proxy.ts` is added in a controlled pass.
- **Route guards remain authoritative** — protected routes still redirect to `/login?next=...` via server guards.
- **RLS remains enforced** on all user-owned tables.
- **Email/password auth** remains the v1 auth model (no OAuth, magic link, or OTP in app code).
- **Users may need to log in again** when Supabase access tokens expire until cookie refresh is reintroduced. This is intentional to restore production availability.

### Future: cookie refresh via `src/proxy.ts`

Reintroduce session cookie refresh using Next 16 **`src/proxy.ts`**, not `middleware.ts`:

- Proxy should be **self-contained** and **Node runtime by default**.
- Do **not** import shared app helpers (`@/lib/*`, guards, `server.ts`) into proxy.
- Proxy refreshes cookies only — **must never redirect** for access control.

## Authority: `getUser()` not `getSession()`

- **Allowed:** `supabase.auth.getUser()` on server (guards, actions).
- **Forbidden:** `getSession()` for access control (stale JWT risk).
- Client browser client exists for future use but must not gate routes.

## Request flow

```
Request
  → Server Component / Server Action
  → guard*() or resolvePostAuthDestination()
  → getServerUserId()
  → redirect with next OR render
```

## Guards

### `guardAuthenticatedAppRoute(routePath)`

Used by: `/today`, `/today/add`, `/fixed-costs`, `/settings`.

**Public (no guard):** `/about`, `/how-it-works`, `/privacy`, `/security`, `/terms`, `/contact`, `/login`.

1. No user → `auth_redirect_to_login` → `/login?next=<sanitized route>`
2. Incomplete onboarding → `onboarding_incomplete_redirect` → `/onboarding?step=N&next=...`
3. Else return `{ userId }`

### `guardOnboardingPage({ requestedStep, next })`

Used by: `/onboarding`.

1. No user → login with `next` preserved
2. Complete + step 1–2 → redirect to `next` (default `/today`)
3. Canonicalise step (no loops) preserving `next`

### Login page (v1: email + password only)

Single form: `passwordAuthAction` in `src/app/actions/auth.ts`.

- One `<form action={passwordAuthAction}>` with email, password, hidden `next`, and submit buttons `intent=login` | `intent=signup`.
- **Not used in v1:** magic link, OTP/code login, OAuth (`signInWithOtp`, `verifyOtp`, `signInWithOAuth`).
- Login: `signInWithPassword({ email, password })` then redirect.
- Signup: `signUp({ email, password })`. If `data.session` is null (email confirmation on), show inline message — do not redirect to login silently.
- Errors and confirmation messages return as `AuthActionState` (`error` / `message`), not uncaught throws.

If session already valid → `login_page_with_auth_cookie` → `resolvePostAuthDestination(next)` (not a blind redirect to `/`).

## Onboarding complete

Requires **both**:

- `budget_settings` row
- `savings_targets` row

Bill streams are optional (steps 3–4).

## `next` parameter

- Sanitized internal paths only (`sanitizeNext`).
- Rejects `//`, `https://`, etc.
- Default after auth: `/today`
- Carried through onboarding via hidden fields and query string.

## Files

| File | Role |
|------|------|
| `src/lib/auth/server.ts` | `getServerUserId()` |
| `src/lib/auth/guard.ts` | Route guards |
| `src/lib/auth/redirect.ts` | `next` sanitization, post-auth routing |
| `src/lib/auth/log.ts` | Structured auth events |
| `src/app/actions/auth.ts` | `passwordAuthAction`, `signOut` |
| `src/app/login/LoginForm.tsx` | Client form (no access control) |
| `src/lib/supabase/server.ts` | Server Components / actions only (`next/headers`) |

## Related docs

- [Auth smoke test](../ops/auth-smoke-test.md)
- [Auth observability](../ops/auth-observability.md)
