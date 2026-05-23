# Privacy and security (summary)

Short pointer. Full architecture: **[docs/security/](../security/privacy-security-architecture.md)**.

## Essentials

- Burnline stores **sensitive personal financial data** (income, savings, bills, spends). It does **not** sell that data.
- Security design follows **ISO/IEC 27001**-style and **ISO/IEC 27701**-style principles — **not certification**, no badges.
- **Supabase Auth** + **Postgres RLS** on all user tables (`user_id = auth.uid()`).
- App uses **anon key only** — never commit `.env.local` or use **service role** in this codebase.
- v1: **no bank sync**, **no third-party analytics**.
- Do not share repo **zip** archives that include `.env.local`.

## Documents

| Doc | Topic |
|-----|--------|
| [Privacy & security architecture](../security/privacy-security-architecture.md) | Principles and current stack |
| [Data classification](../security/data-classification.md) | Table/field sensitivity |
| [Threat model](../security/threat-model.md) | Risks and mitigations |
| [RLS policy review](../security/rls-policy-review.md) | Expected policies |
| [Logging redaction](../security/logging-redaction.md) | Safe logging |
| [Security roadmap](../security/security-roadmap.md) | Now / beta / later |
| [Auth session](../architecture/auth-session.md) | Sessions and guards |
