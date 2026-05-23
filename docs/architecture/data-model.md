# Data model

Authoritative schema lives in `supabase/migrations/`. One currency per user on `profiles.currency`.

## Tables

### profiles

User profile: `id` (auth.users), `currency` (default SGD), `timezone` (IANA, default `Asia/Singapore`), `tracking_start_date` (date, nullable), timestamps.

`timezone` is the **financial timezone** — source of truth for which calendar day counts as **Today** (device timezone is only the onboarding default). `tracking_start_date` is set when onboarding completes; legacy null rows fall back to today in app code. See [timezone.md](timezone.md).

### budget_settings

Income: `income_amount_cents`, `income_frequency` (weekly | fortnightly | monthly), `next_payday`.

### savings_targets

`amount_cents`, `frequency` (weekly | fortnightly | monthly | annually).

**v1:** exactly one row per user (`savings_targets_user_id_unique` on `user_id`). Upsert/update in app code; do not rely on multiple rows.

### bill_streams

Recurring cost family: `name`, `category`, `frequency`, `estimated_amount_cents`, `is_active`, `estimation_method`.

### bill_payments

Payment against a stream: `amount_cents`, `paid_on`, optional `note`. Refines estimate; does not create manual spend.

### manual_spends

Daily discretionary spend: `amount_cents`, `category`, `spent_on` (user calendar date), optional `note`.

## Indexes

- `user_id` on all user-owned tables
- `(user_id, spent_on)` on manual_spends
- `(user_id, paid_on)` on bill_payments
- `bill_stream_id` on bill_payments
- active bill streams by user
- `savings_targets_user_id_unique` on `savings_targets (user_id)`

## RLS

Enabled on all tables. Policy: `user_id = auth.uid()` for SELECT, INSERT, UPDATE, DELETE.

## Onboarding gate

Onboarding is **complete** only when both exist for the user:

- `budget_settings` (income / pay cycle)
- `savings_targets`

Bill streams are optional (steps 3–4).

Redirect behaviour (see `src/lib/onboarding/status.ts`):

| State | `/` | `/today`, `/settings`, … | `/onboarding` |
|-------|-----|--------------------------|---------------|
| Missing income | → `/onboarding?step=1` | → earliest missing step | Shows step 1 |
| Income only | → `/onboarding?step=2` | → step 2 | Cannot skip ahead of step 2 |
| Income + savings | → `/today` | App routes | Steps 3–4 optional; steps 1–2 redirect to `/today` |

Requests to `/onboarding?step=4` before savings exist resolve to step 2 (no loop).

## Bill payment integrity

`bill_payments` RLS insert/update requires `bill_stream_id` to reference a `bill_streams` row owned by `auth.uid()`. Server actions also verify ownership before insert.

## Domain parsing

Supabase row strings for frequencies and currency are parsed in `src/lib/db/domain.ts` before entering the pure calculation engine (`src/lib/budget/`).

## Auth

See [auth-session.md](auth-session.md). Route guards enforce access; middleware only refreshes cookies.
