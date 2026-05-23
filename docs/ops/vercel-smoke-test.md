# Burnline Vercel smoke test

Manual checks after a **Production** or **Preview** deploy. Allow ~15 minutes.

Burnline v1 has **no** Next middleware or proxy. Route guards and RLS enforce access. Request-boundary cookie refresh is intentionally deferred.

## Pre-checks (before opening the URL)

- [ ] Deployment status is **Ready** (not Failed or Building)
- [ ] Deployed commit matches the intended branch (usually `main`)
- [ ] **Framework Preset** is **Next.js** (Vercel → Settings → General)
- [ ] **Root Directory** is blank / repo root
- [ ] **Output Directory** is blank (not overridden)
- [ ] **Production Branch** is `main`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set for this environment
- [ ] No `middleware.ts` or `proxy.ts` in the deployed commit
- [ ] Deployment build log lists App Router routes (`/`, `/login`, `/today`, `/about`, etc.)
- [ ] Local `npm run build` lists the same app routes

## Public routes (no auth required)

- [ ] Open `/` — redirects to login or post-auth destination (not platform 404)
- [ ] Open `/about` — page loads
- [ ] Open `/privacy` — page loads
- [ ] Open `/login` — login form loads

## Auth flow

- [ ] Sign in with email + password (v1 auth model only)
- [ ] If onboarding incomplete: land on `/onboarding?...`
- [ ] If onboarding complete: land on `/today`

## Protected routes (server guards)

- [ ] Open `/today` — loads when signed in
- [ ] Open `/fixed-costs` — loads when signed in
- [ ] Open `/settings` — loads when signed in
- [ ] Open `/today/add` — fallback add-spend route loads when signed in

## Core loop

- [ ] On `/today`, open **Add spend** modal — sheet opens
- [ ] Add a manual spend — today remaining updates
- [ ] Log out from Settings
- [ ] Open `/today` while signed out — redirects to `/login?next=/today` (or encoded equivalent)

## Platform error triage

### If production shows platform `404 NOT_FOUND`

**Do not assume this is a missing App Router route.** Burnline has hit this when the build succeeded and routes were listed, but **Framework Preset was not Next.js**. Suspect Vercel project configuration first.

If the build succeeds and routes are listed, but production shows platform **404 NOT_FOUND**:

1. Check **Framework Preset** is **Next.js**.
2. Check **Output Directory** is **blank** (not overridden).
3. Check **Root Directory** is repo root (blank).
4. Check domain/alias points to the **latest** deployment.
5. Redeploy **without build cache**.

Then:

6. Verify no `middleware.ts` or `proxy.ts` in the deployed commit.
7. Compare deployment build route list to local `npm run build` output.

### If production shows `MIDDLEWARE_INVOCATION_FAILED`

1. Verify no `middleware.ts` or `proxy.ts` exists in the deployed commit
2. Verify deployment is not serving an older commit that still had middleware/proxy
3. Redeploy without build cache
4. Check Vercel deployment logs for the exact error

## Session note

Without request-boundary cookie refresh, users may occasionally need to log in again after Supabase session expiry. This is expected in v1.

Do **not** add `middleware.ts` or `proxy.ts` without meeting the guardrails in [auth-session.md](../architecture/auth-session.md).

## Sign-off

| Result | Notes |
|--------|--------|
| Pass / Fail | |
| Date | |
| Deployment URL | |
| Commit | |
