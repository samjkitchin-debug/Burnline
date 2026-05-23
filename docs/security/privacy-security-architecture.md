# Privacy and security architecture

Burnline handles **sensitive personal financial data**: income, savings targets, fixed costs, bill streams, bill payments, manual spends, and optional free-text notes. Some users may record tax- or debt-related labels in bill or spend names.

## Standards framing (not certification)

Security design is **inspired by**:

- **ISO/IEC 27001** — information-security management principles (risk treatment, access control, secure operations).
- **ISO/IEC 27701** — privacy-management extension (data minimisation, purpose limitation, individual rights readiness).

**Burnline does not claim ISO 27001, ISO 27701, ISO 28001, or any other certification.** ISO 28001 is supply-chain security and is **not** the primary target for this product. There are no compliance badges or marketing claims in the app.

This documentation describes **architecture discipline** for v1 and near-term evolution.

## Core principles

| Principle | Application in Burnline |
|-----------|-------------------------|
| Data minimisation | Store only what v1 needs; no bank credentials, receipts, or analytics payloads |
| Purpose limitation | Data used for daily spend guidance and pay-cycle position only |
| Least privilege | RLS + server-side `auth.uid()` scoping; no service role in app code |
| User isolation | Every user-owned row tied to `auth.uid()` |
| Secure defaults | RLS enabled; env secrets out of repo; anon key only in frontend |
| Defence in depth | RLS + server action ownership checks + route guards |
| No sensitive logging | Auth logs are structured; no amounts, notes, or tokens |
| Privacy by design | Financial timezone preference and `tracking_start_date` control calendar-day boundaries; no third-party trackers in v1 |
| Deletion/export readiness | Documented roadmap; not full self-service in v1 |
| Documented risk treatment | [Threat model](threat-model.md), [roadmap](security-roadmap.md) |

## Current architecture

### Identity and access

- **Supabase Auth** — email/password in v1 UI (session cookies via `@supabase/ssr`).
- **Server identity** — `getServerUserId()` from `supabase.auth.getUser()` (not untrusted JWT decode).
- **Route guards** — authenticated app routes and onboarding gates in `src/lib/auth/guard.ts`.
- **`next` redirect sanitisation** — internal paths only (`src/lib/auth/redirect.ts`).

### Data store

- **Supabase Postgres** — all app data in user-scoped tables.
- **RLS enabled** on: `profiles`, `budget_settings`, `savings_targets`, `bill_streams`, `bill_payments`, `manual_spends`.
- **Policies** — `user_id = auth.uid()` (profiles: `id = auth.uid()`).
- **Bill payments** — insert/update require `bill_stream_id` owned by the same user ([RLS review](rls-policy-review.md)).

### Application tier

- **Server actions** — mutations; `user_id` always from server session, never from client form fields.
- **Bill stream ownership** — `requireOwnedBillStream()` before payment insert.
- **Pure calculation engine** — `src/lib/budget/` has no Supabase or network imports.
- **Domain parsing** — `src/lib/db/domain.ts` validates frequency/currency strings from DB rows.

### Client and secrets

- **Frontend env** — only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`src/lib/env.ts` fails loudly if missing).
- **No service role** in app, middleware, or browser client code.
- **`.env.local`** gitignored; `.env.example` placeholders only.

### Explicit non-goals (v1)

- No bank sync or open banking.
- No third-party analytics (no PostHog, GA, etc.).
- No sale or licensing of personal financial data.
- No OAuth, magic link, or OTP in v1 UI (documented for later only).

## Related documents

| Document | Topic |
|----------|--------|
| [Data classification](data-classification.md) | Sensitivity per table/field |
| [Threat model](threat-model.md) | Risks and mitigations |
| [RLS policy review](rls-policy-review.md) | Expected policies |
| [Logging redaction](logging-redaction.md) | Safe vs unsafe logs |
| [Security roadmap](security-roadmap.md) | Now / beta / later |

## Operational references

- [Setup and deployment](../ops/setup-and-deployment.md) — env and Supabase checklist  
- [Auth session](../architecture/auth-session.md) — session doctrine  
- [Auth observability](../ops/auth-observability.md) — allowed auth log events  
