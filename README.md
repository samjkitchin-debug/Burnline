# Burnline

**Burnline** is a daily spend-speedometer: *what can I spend today and still protect your savings target?*

**Core loop:** Enter every spend. Beat today. Get through the pay cycle under the line. Move/protect the savings. Repeat.

- **Spent today** = fixed daily burn + manual spends today  
- **Today’s line** = fixed daily burn + manual daily target (savings is protected, not counted as spend)  
- **Pay-cycle position** = main progress (tracked local days only)  
- **Year position** = secondary scoreboard  

Recurring fixed costs spread per day (`amount × 12 ÷ 365` for monthly bills — not `× 12 ÷ 52`). Add spend is **modal-first** on Today; `/today/add` is a fallback route.

## Prerequisites

- Node.js 20+
- npm
- Supabase project [huptejlrdmbkwuxmaejm](https://supabase.com/dashboard/project/huptejlrdmbkwuxmaejm)
- Git

## Local setup

```bash
git clone https://github.com/samjkitchin-debug/Burnline.git
cd Burnline
npm install
cp .env.example .env.local
```

Edit `.env.local` with **Project URL** and **anon key** from [API settings](https://supabase.com/dashboard/project/huptejlrdmbkwuxmaejm/settings/api). See `.env.example`.

Apply all migrations under `supabase/migrations/` (see [setup guide](docs/ops/setup-and-deployment.md)). **Do not commit** `.env.local` or `*.zip` archives that contain secrets.

**Auth (v1):** email + password only — no magic link, OTP, or OAuth in the app. Supabase **Authentication → Providers → Email**: sign-up on, **Confirm email OFF** for local dev. Site URL `http://localhost:3000`, redirect `http://localhost:3000/**`.

```bash
npm run dev
```

Open http://localhost:3000 → sign up → onboarding → **Today**.

Manual QA: [local smoke test](docs/ops/local-smoke-test.md), [auth smoke test](docs/ops/auth-smoke-test.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (port 3000) |
| `npm test` | Vitest |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

## Supabase migrations (order)

1. `20260523000000_initial_schema.sql`
2. `20260523100000_bill_payment_stream_ownership.sql`
3. `20260523120000_profile_timezone_savings_unique.sql`
4. `20260523130000_profile_tracking_start_date.sql`

## Security posture (summary)

- Supabase Auth + Postgres **RLS** on user-owned tables  
- **No** service role key in app code  
- **No** bank sync, third-party analytics, or sale of personal financial data in v1  
- ISO/IEC 27001/27701-**inspired** discipline — **not certified**  
- Details: [security docs](docs/security/privacy-security-architecture.md)

## Project structure

```
src/app/              # Routes (today, onboarding, login, info pages, …)
src/app/actions/      # Server actions
src/components/       # UI shell, navigation, spend, today
src/lib/budget/       # Calculation engine (pure TS)
src/lib/data/         # Supabase loaders
supabase/migrations/  # Schema + RLS
docs/                 # Product, architecture, ops, security
```

## Documentation

| Doc | Description |
|-----|-------------|
| [v1 spec](docs/product/v1-spec.md) | Product guardrails |
| [Boilerplate pages](docs/product/boilerplate-pages.md) | About, privacy, terms, … |
| [Navigation](docs/design/navigation.md) | Bottom nav + hamburger |
| [Calculation engine](docs/architecture/calculation-engine.md) | Formulas |
| [Timezone](docs/architecture/timezone.md) | Financial timezone + tracking start |
| [Auth session](docs/architecture/auth-session.md) | Guards and session doctrine |
| [Setup & deployment](docs/ops/setup-and-deployment.md) | Supabase + GitHub |
| [Schema](docs/schema.md) | Tables and fields |

## Known v1 limitations

- Email/password only (no Google/OAuth/magic link in UI)
- No edit/delete manual spends after save
- Limited bill stream editing
- No password reset flow yet
- No offline mode
- No account deletion/export UI yet
- No daily snapshots for mid-cycle setting changes
- Requires live Supabase

## Links

- Supabase: https://supabase.com/dashboard/project/huptejlrdmbkwuxmaejm  
- GitHub: https://github.com/samjkitchin-debug/Burnline  
