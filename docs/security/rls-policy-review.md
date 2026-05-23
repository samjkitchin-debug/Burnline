# RLS policy review

Row Level Security is **enabled** on all user-owned tables in `supabase/migrations/20260523000000_initial_schema.sql`, with strengthened bill-payment policies in `20260523100000_bill_payment_stream_ownership.sql`.

**Burnline does not use the Supabase service role in application code.** The anon key + user JWT is the only client credential.

## Policy matrix

### profiles

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | `profiles_select_own` | `id = auth.uid()` |
| INSERT | `profiles_insert_own` | `id = auth.uid()` |
| UPDATE | `profiles_update_own` | `id = auth.uid()` |

No DELETE policy in v1 (profile lifecycle tied to Auth user).

### budget_settings

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | `budget_settings_select_own` | `user_id = auth.uid()` |
| INSERT | `budget_settings_insert_own` | `user_id = auth.uid()` |
| UPDATE | `budget_settings_update_own` | `user_id = auth.uid()` |
| DELETE | `budget_settings_delete_own` | `user_id = auth.uid()` |

### savings_targets

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | `savings_targets_select_own` | `user_id = auth.uid()` |
| INSERT | `savings_targets_insert_own` | `user_id = auth.uid()` |
| UPDATE | `savings_targets_update_own` | `user_id = auth.uid()` |
| DELETE | `savings_targets_delete_own` | `user_id = auth.uid()` |

v1 app expects **one row per user** (`savings_targets_user_id_unique` migration).

### bill_streams

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | `bill_streams_select_own` | `user_id = auth.uid()` |
| INSERT | `bill_streams_insert_own` | `user_id = auth.uid()` |
| UPDATE | `bill_streams_update_own` | `user_id = auth.uid()` |
| DELETE | `bill_streams_delete_own` | `user_id = auth.uid()` |

### bill_payments

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | `bill_payments_select_own` | `user_id = auth.uid()` |
| INSERT | `bill_payments_insert_own` | `user_id = auth.uid()` **and** `bill_stream_id` references a `bill_streams` row where `bs.user_id = auth.uid()` |
| UPDATE | `bill_payments_update_own` | Same `USING` + `WITH CHECK` as insert |
| DELETE | `bill_payments_delete_own` | `user_id = auth.uid()` |

**Linked-resource rule:** prevents inserting a payment against another user’s stream while spoofing `user_id`.

### manual_spends

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | `manual_spends_select_own` | `user_id = auth.uid()` |
| INSERT | `manual_spends_insert_own` | `user_id = auth.uid()` |
| UPDATE | `manual_spends_update_own` | `user_id = auth.uid()` |
| DELETE | `manual_spends_delete_own` | `user_id = auth.uid()` |

## Database functions

| Function | Role | Notes |
|----------|------|--------|
| `handle_new_user()` | `SECURITY DEFINER` | Inserts empty `profiles` row on signup; minimal scope, `search_path = public` |

Review any future `SECURITY DEFINER` functions carefully.

## Application layer (not a substitute for RLS)

Server actions must still:

- Resolve `user_id` from `getServerUserId()`, **never** from `formData.get("user_id")`.
- Call `requireOwnedBillStream()` before bill payment operations.
- Validate enums and money via `src/lib/db/domain.ts` and `parseDollarsToCents`.
- Use route guards so unauthenticated users do not hit data loaders.

RLS is the **last line of defence** if application code regresses; it is not the only control.

## Verification checklist

- [ ] Dashboard → **Database** → each table → RLS **enabled**
- [ ] Policies match this document after migrations
- [ ] Second test user cannot `select` first user’s `manual_spends` via SQL Editor with user JWT (optional manual test)
- [ ] No `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` in migrations

## Service role

| Use | Allowed in v1 |
|-----|----------------|
| Supabase dashboard admin | Yes (operators only) |
| Next.js app / server actions | **No** |
| CI scripts | Only if isolated; never in deployed app env as `NEXT_PUBLIC_*` |
