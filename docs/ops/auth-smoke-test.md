# Burnline auth smoke test

Manual checks for session reliability before feature work. Run on **http://localhost:3000** with Supabase configured.

Allow ~20 minutes. Use a dedicated test account.

## Setup

Burnline v1 is **email + password only**. No magic link, OTP code, or OAuth in the app.

- [ ] `.env.local` present (not committed)
- [ ] **Authentication → Providers → Email:** Enable ON, Allow new users to sign up ON, **Confirm email OFF** (local dev)
- [ ] Site URL: `http://localhost:3000`
- [ ] Redirect URL: `http://localhost:3000/**`
- [ ] If Confirm email is ON: expect green “Check your email to confirm” after Create account, not an immediate session

## Signed-out access

- [ ] Open `/today` while signed out
- [ ] Expect redirect to `/login?next=%2Ftoday` (or `/login?next=/today`)
- [ ] Log in with valid credentials
- [ ] If onboarding incomplete: land on `/onboarding?...&next=...` (not a loop)
- [ ] If onboarding complete: land on `/today`

## Persistence

- [ ] Log in and open `/today`
- [ ] Hard reload `/today` — still signed in, no login bounce
- [ ] Open `/today` in a new tab — still signed in
- [ ] Close browser completely, reopen `/today` — still signed in if session valid
- [ ] **Note:** Root middleware/proxy cookie refresh is temporarily disabled. Long-lived sessions may require re-login when access tokens expire until `src/proxy.ts` is reintroduced.

## Deep link

- [ ] Sign out
- [ ] Open `/today/add` while signed out
- [ ] Expect `/login?next=...` including `/today/add`
- [ ] Log in
- [ ] Complete onboarding if prompted (income + savings)
- [ ] Expect final destination `/today/add` (not stuck on `/` or `/today` only)

## Signup

- [ ] Sign out
- [ ] `/login?next=/today` → fill email + password → click **Create account** (not Log in)
- [ ] Button shows “Please wait…” while action runs
- [ ] With Confirm email OFF: redirect to onboarding or `/today` (not silent bounce back to empty login)
- [ ] With Confirm email ON: stay on login with green message “Account created. Check your email…”
- [ ] Invalid signup (weak password, duplicate user) shows red inline error
- [ ] No empty-password signup error from missing fields

## Onboarding partial state

- [ ] New or test user with `budget_settings` only (no `savings_targets`)
- [ ] Open `/today`
- [ ] Expect `/onboarding?step=2` (and optional `next`), **not** redirect loop between `/today` and `/onboarding`
- [ ] Complete savings step
- [ ] Reach `/today` or summary then `/today`

## Optional bill steps

- [ ] User with income + savings can open `/onboarding?step=3` without forced `/today`
- [ ] User with income + savings visiting `/onboarding?step=1` redirects to `next` or `/today`

## Logout

- [ ] From Settings, **Log out**
- [ ] Expect `/login`
- [ ] Open `/today` — redirects to login with `next`
- [ ] Open `/fixed-costs` — redirects to login with `next`

## Login page session

- [ ] While signed in, open `/login`
- [ ] Expect immediate bounce to `/today` (or onboarding), not login form

## Linked-resource ownership

- [ ] User A: create bill stream
- [ ] User B: cannot add `bill_payment` for User A’s `bill_stream_id` (server action error or RLS failure)

## Anti-patterns to watch (fail if seen)

- [ ] No redirect to login from middleware or proxy (none active — guards only)
- [ ] No client-side “checking session…” on every page load
- [ ] No `getSession()` in Network tab used for route gates
- [ ] Auth logs in server console contain no emails, tokens, or spend amounts

## Sign-off

| Result | Notes |
|--------|--------|
| Pass / Fail | |
| Date | |
| Branch | |
