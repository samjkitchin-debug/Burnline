# Burnline — setup and deployment

Operational guide for connecting this repo to Supabase, GitHub, and (later) Vercel. No secrets belong in this document or in git.

## Project identity

| Item | Value |
|------|--------|
| App name | **Burnline** |
| Supabase project ref | `huptejlrdmbkwuxmaejm` |
| Supabase dashboard | https://supabase.com/dashboard/project/huptejlrdmbkwuxmaejm |
| GitHub repository | https://github.com/samjkitchin-debug/Burnline |

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm
- Git
- A Supabase account with access to project `huptejlrdmbkwuxmaejm`
- (Optional) [Supabase CLI](https://supabase.com/docs/guides/cli) for `db push` / `db reset`

## Local setup

1. Clone the repository:

   ```bash
   git clone https://github.com/samjkitchin-debug/Burnline.git
   cd Burnline
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create local environment file (never commit this):

   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` with values from the Supabase dashboard (see [Required environment variables](#required-environment-variables)).

5. Apply the database migration (see [Supabase checklist](#supabase-checklist)).

6. Start the dev server:

   ```bash
   npm run dev
   ```

7. Open http://localhost:3000 and run the [local smoke test](local-smoke-test.md).

## Required environment variables

Only these are used by the Next.js app (client-safe):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key for browser + SSR |

Copy placeholders from `.env.example`. Find live values under **Project Settings → API** in the dashboard.

**Do not:**

- Commit `.env.local`
- Put `service_role` or database passwords in the frontend or in `NEXT_PUBLIC_*` variables
- Hardcode real keys in source code or docs
- Share project **zip** archives that include `.env.local` or keys

Burnline does **not** sell personal financial data. v1 has **no bank sync** and **no third-party analytics**.

## Supabase migration application

Migration files (apply in order):

1. `supabase/migrations/20260523000000_initial_schema.sql`
2. `supabase/migrations/20260523100000_bill_payment_stream_ownership.sql`
3. `supabase/migrations/20260523120000_profile_timezone_savings_unique.sql` — `profiles.timezone`, unique `savings_targets(user_id)`
4. `supabase/migrations/20260523130000_profile_tracking_start_date.sql` — `profiles.tracking_start_date`

Greenfield: run all four in order. If (1)–(2) were applied earlier, run (3)–(4) only.

**Remote project `huptejlrdmbkwuxmaejm`:** confirm via dashboard or `supabase migration list` that all four are applied before shipping.

### Option A — Supabase SQL Editor (dashboard)

1. Open https://supabase.com/dashboard/project/huptejlrdmbkwuxmaejm  
2. Go to **SQL** → **New query**  
3. Paste the full contents of the migration file  
4. Run the query  
5. Confirm no errors

### Option B — Supabase CLI (linked project)

```bash
supabase link --project-ref huptejlrdmbkwuxmaejm
supabase db push
```

Use a personal access token when prompted. Do not commit CLI credentials.

## Supabase checklist

After applying the migration, verify in the dashboard:

- [ ] **Tables exist:** `profiles`, `budget_settings`, `savings_targets`, `bill_streams`, `bill_payments`, `manual_spends`
- [ ] **RLS enabled** on all user-owned tables (`budget_settings`, `savings_targets`, `bill_streams`, `bill_payments`, `manual_spends`, and `profiles` where applicable)
- [ ] **Policies** enforce ownership (`user_id = auth.uid()` on data tables; `id = auth.uid()` on `profiles`)
- [ ] **Bill payments:** insert/update policies require `bill_stream_id` to belong to the same user (see migration `20260523100000_bill_payment_stream_ownership.sql`)
- [ ] **Trigger** `on_auth_user_created` inserts a row into `profiles` for new `auth.users` rows
- [ ] **Email/password auth** enabled under **Authentication → Providers**
- [ ] **Site URL / redirect URLs** configured (see below)

### Auth redirect URLs

Under **Authentication → URL configuration**:

**Site URL (local development):**

```
http://localhost:3000
```

**Redirect URLs** — add at least:

```
http://localhost:3000/**
```

**Later (Vercel / production)** — add when you have real hostnames (replace placeholders):

```
https://your-vercel-domain.vercel.app/**
https://your-production-domain.com/**
```

Do not use invented production domains until they exist.

### v1 auth methods (app code)

Burnline v1 uses **email + password only** via `passwordAuthAction`. The app does not call magic link, OTP/code login, or OAuth.

### Later optional auth providers (not in v1 UI)

- Google OAuth  
- Magic links  

## Auth configuration checklist

**Authentication → Providers → Email**

- [ ] Enable Email provider: **ON**
- [ ] Allow new users to sign up: **ON**
- [ ] Confirm email: **OFF** for local dev (recommended)
- [ ] Do not enable magic link–only flows for v1 testing

**If Confirm email is ON**

- [ ] Create account shows: “Account created. Check your email to confirm, then log in.”
- [ ] User must confirm inbox before `signInWithPassword` returns a session

**URL configuration**

- [ ] **Site URL:** `http://localhost:3000`  
- [ ] **Redirect URLs:** `http://localhost:3000/**`  
- [ ] Never commit `.env.local` (listed in `.gitignore`)  

**Other**

- [ ] Minimum password length acceptable for your test accounts  
## GitHub push checklist

- [ ] Remote `origin` → `https://github.com/samjkitchin-debug/Burnline.git`  
- [ ] `.env.local` not tracked (`git check-ignore .env.local` should match)  
- [ ] `.env.example` tracked (placeholders only)  
- [ ] `npm test`, `npm run lint`, `npm run build` pass locally  
- [ ] No secrets in `git diff` before push  

**Recommended default branch:** `main`

```bash
git branch -M main
git push -u origin main
```

If your local branch is still `master`, rename before push or push explicitly: `git push -u origin master:main`.

## Vercel deployment checklist (later)

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project env (required for Edge middleware cookie refresh)
- [ ] Middleware is **Edge Runtime** — it must only use `src/lib/supabase/edge-middleware.ts` (not `server.ts`, not route guards, not `next/headers`)
- [ ] Import repo https://github.com/samjkitchin-debug/Burnline  
- [ ] Framework preset: **Next.js**  
- [ ] Set environment variables in Vercel project settings (not in repo):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add Vercel preview/production URLs to Supabase **Redirect URLs**  
- [ ] Update Supabase **Site URL** for production when ready  
- [ ] Run production build: `npm run build`  
- [ ] Deploy; do not enable service role in Vercel for the Next.js app in v1  

## Post-deployment smoke test checklist

- [ ] Open deployed URL — login page loads  
- [ ] Sign up / log in  
- [ ] Complete onboarding (income → savings → bill stream → summary)  
- [ ] **Today** shows hero **Spent today** and **Today’s line**; + Add spend opens modal  
- [ ] Add manual spend — today remaining updates  
- [ ] Add large/Bills spend → spread as recurring bill — daily burn updates, not double-counted as today manual spend  
- [ ] **Already included** — no budget impact  
- [ ] **Fixed costs** — add payment, estimate reflects history  
- [ ] Log out and log back in — session persists  
- [ ] Confirm RLS: second test user cannot see first user’s rows (optional but recommended)  

## Security and privacy

Architecture discipline (ISO/IEC 27001- and 27701-**inspired** — **not certification**):

- [Privacy and security architecture](../security/privacy-security-architecture.md)  
- [Data classification](../security/data-classification.md)  
- [Threat model](../security/threat-model.md)  
- [RLS policy review](../security/rls-policy-review.md)  
- [Logging redaction](../security/logging-redaction.md)  
- [Security roadmap](../security/security-roadmap.md)  

Basic HTTP security headers are set in `next.config.ts`. Content-Security-Policy is deferred until beta (see roadmap).

## Related docs

- [Local smoke test](local-smoke-test.md)  
- [Auth smoke test](auth-smoke-test.md)  
- [Auth session architecture](../architecture/auth-session.md)  
- [Privacy and security (summary)](privacy-and-security.md)  
- [Schema](../schema.md)  
- [v1 product spec](../product/v1-spec.md)  
