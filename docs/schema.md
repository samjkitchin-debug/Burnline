# Database schema (authoritative)

See `supabase/migrations/20260523000000_initial_schema.sql` for DDL.

## profiles

| Column | Type |
|--------|------|
| id | uuid PK → auth.users |
| currency | text default SGD |
| timezone | text not null default `Asia/Singapore` (IANA) — financial calendar day source of truth |
| tracking_start_date | date nullable — first local tracking day (set when onboarding completes) |
| created_at | timestamptz |
| updated_at | timestamptz |

## budget_settings

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid → auth.users (unique) |
| income_amount_cents | integer |
| income_frequency | weekly \| fortnightly \| monthly |
| next_payday | date |
| created_at | timestamptz |
| updated_at | timestamptz |

## savings_targets

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid (unique — one row per user in v1) |
| amount_cents | integer |
| frequency | weekly \| fortnightly \| monthly \| annually |
| created_at | timestamptz |
| updated_at | timestamptz |

Unique index: `savings_targets_user_id_unique` on `(user_id)`.

## bill_streams

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid |
| name | text |
| category | text |
| frequency | weekly \| fortnightly \| monthly \| quarterly \| annually |
| estimated_amount_cents | integer |
| is_active | boolean default true |
| estimation_method | text default rolling_average |
| created_at | timestamptz |
| updated_at | timestamptz |

## bill_payments

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid |
| bill_stream_id | uuid → bill_streams |
| amount_cents | integer |
| paid_on | date |
| note | text nullable |
| created_at | timestamptz |

## manual_spends

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid |
| amount_cents | integer |
| category | text |
| note | text nullable |
| spent_on | date |
| created_at | timestamptz |
| updated_at | timestamptz |
