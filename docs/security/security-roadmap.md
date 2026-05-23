# Security roadmap

Prioritised hardening for Burnline. Inspired by ISO/IEC 27001 and 27701 practices; **no certification claimed**.

---

## Now / v1 (in place or documented)

| Item | Status |
|------|--------|
| RLS on all user tables | Done — see [RLS policy review](rls-policy-review.md) |
| No service role in app code | Done |
| No third-party analytics | Done |
| No sensitive logging in `src/` | Done — [logging redaction](logging-redaction.md) |
| `.env.local` gitignored; `*.zip` gitignored | Done |
| `requirePublicEnv()` for Supabase URL/anon key | Done |
| Route guards + `getServerUserId()` | Done |
| Auth smoke tests / observability docs | Done |
| Strict money parsing | Done |
| Timezone / local calendar day | Done |
| `next` redirect sanitisation | Done |
| Bill payment stream ownership (RLS + server) | Done |
| Security architecture docs | Done |
| Basic security headers (Next config) | Done — see `next.config.ts` |
| Delete/export | **Design noted** — not self-service in v1 |
| Content-Security-Policy | **Deferred** — see below |

---

## Before public beta

| Item | Notes |
|------|--------|
| Account deletion | Supabase user delete + cascade app rows |
| Data export | JSON/CSV of user tables; purpose-limited |
| Formal privacy policy | Published; matches actual data practices |
| Password reset flow | Supabase reset email; secure redirect URLs |
| Rate limiting review | Auth endpoints; server actions abuse |
| CSP / security headers review | Tighten CSP without breaking Supabase/Next dev |
| Dependency audit cadence | `npm audit`, Dependabot |
| Backup / restore expectations | Supabase PITR; operator runbook |
| Daily snapshot privacy review | If historical snapshots added when settings change |
| Supabase Auth settings review | Confirm email, leak protection, redirect URLs |
| RLS regression test | Two-user isolation automated test |
| Privacy policy link in app | Settings footer |

---

## Later

| Item | Notes |
|------|--------|
| Field-level encryption for notes | Assess if free-text notes warrant encryption at rest |
| Audit trail for settings changes | Who changed income/savings and when |
| Security incident runbook | Contact tree, revoke keys, notify users |
| DPIA / privacy impact assessment | If EU/UK users at scale |
| External security review | If monetised or high-profile launch |
| OAuth / magic link threat model | Separate review when enabled |
| Bank sync | New trust boundary; not v1 |
| Allowlist for `next` redirects | Reduce internal open-navigation |
| Secret scanning in CI | Prevent committed `.env` |

---

## Explicit non-goals (v1)

- ISO certification or badge display  
- ISO 28001 as a target standard  
- Selling or sharing personal financial data  
- Bank transaction import  
- Admin impersonation without audit  

---

## CSP note

A strict **Content-Security-Policy** is not set in v1 to avoid breaking Next.js dev tooling and Supabase client behaviour. Track in beta checklist with staging validation.

Current headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` in `next.config.ts`.
