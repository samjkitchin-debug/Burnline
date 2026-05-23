# Calculation engine

Pure TypeScript under `src/lib/budget/`. No React or Supabase imports.

## Money

All amounts are integer **cents**. UI shows whole dollars via `formatMoney(..., { wholeDollars: true })`.

## Annualised daily conversion

| Frequency | Formula |
|-----------|---------|
| weekly | amount × 52 / 365 |
| fortnightly | amount × 26 / 365 |
| monthly | amount × 12 / 365 |
| quarterly | amount × 4 / 365 |
| annually | amount / 365 |

Do **not** use `monthly × 12 / 52` for daily burn.

## Pay cycles

- **Monthly**: cycle from payday (e.g. 15th) through day before next payday (14th).
- **Weekly / fortnightly**: anchor from configured `next_payday`; actual calendar day counts (not business-day adjusted).

Income amount is **per pay cycle**, not annualised.

## Core formulas (Today)

```
daily_savings_target = annualised(savings) / 365     # protected, not spend
fixed_daily_burn = sum(active bill streams annualised) / 365
cycle_savings_target = daily_savings_target × cycle_days
cycle_fixed_burn = fixed_daily_burn × cycle_days
manual_daily_target = (cycle_income - cycle_savings_target - cycle_fixed_burn) / cycle_days

spent_today = fixed_daily_burn + today_manual_spend
max_today = fixed_daily_burn + manual_daily_target
remaining_today = max_today - spent_today
```

Savings is excluded from `spent_today`.

## Financial timezone

- **`profiles.timezone`** (IANA) is the source of truth for “today”, pay-cycle reference dates, and default `spent_on`.
- On onboarding step 1, the client sends `Intl.DateTimeFormat().resolvedOptions().timeZone` as the default; the user can change **Financial timezone** in Settings.
- Device timezone may differ while travelling; the profile timezone does not auto-update.
- Never use `new Date().toISOString().slice(0, 10)` for user-facing local dates.

Helpers: `getTodayDateStringInTimezone` / `getTodayDateOnlyInTimezone`, `getReferenceDateInTimezone` in `src/lib/dates/timezone.ts`.

## Tracking start

v1 order (local calendar dates only):

1. Earliest manual spend `spent_on` date
2. Else `profiles.tracking_start_date` (set when onboarding completes — today in financial timezone)
3. Else reference (today) in financial timezone

`tracking_start_date` prevents fake pre-app progress. Do **not** infer tracking start from UTC `created_at`.

Spends before tracking start are **ignored** for position maths. Do **not** assume zero manual spend for untracked days before the user started using the app.

## Pay cycle position (primary)

Tracked period in the current pay cycle:

```
tracked_start = max(pay_cycle.start, tracking_start)
tracked_days = inclusiveLocalDayCount(tracked_start, reference_date)   # 1 when start === today
manual_allowed = manual_daily_target × tracked_days
manual_spend = sum(manual spends from tracked_start through reference_date)
pay_cycle_position = manual_allowed - manual_spend
```

Positive = under the line. Negative = over the line.

On day 1 with no manual spend, `pay_cycle_position = manual_daily_target` (matches today’s manual allowance / remaining buffer when today has no manual spend).

**Enough data for UI:** `tracked_days >= 1` in the current pay cycle.

## Days left (copy only)

```
remaining_days_after_today = inclusive days from tomorrow through pay_cycle.end
```

Example: monthly payday on the 26th, reference 23rd → cycle ends 25th → **2** days left (24th, 25th). Days left does **not** affect `tracked_days`.

## Year position (secondary)

```
year_start = max(Jan 1 of reference year, tracking_start)
year_position = manual_daily_target × tracked_year_days - manual_spend_in_year_period
```

Future: historical daily snapshots will be needed if settings change mid-year (not in v1).

## Pay cycle completion

When `reference_date` is in a **new** pay cycle (previous cycle’s start ≠ current cycle’s start) and `reference_date > previous_cycle.end`, the previous pay cycle is complete.

Completion position uses the same tracked-day rules over that completed cycle’s dates.

v1 exposes copy + `cycleCompletion` on the snapshot; **Mark cycle complete** is a UI placeholder (no DB write).

## Over / on-track (Today)

`isTodayOver` when displayed whole-dollar spent today > displayed today’s line, or displayed remaining is negative.

## Bill estimates

Rolling averages by frequency (monthly: 3, quarterly: 2, weekly/fortnightly: 4, annual: latest). See `billEstimates.ts`.

## Entry points

- `calculateBudget(input)` → `BudgetSnapshot`
- `src/lib/budget/positions.ts` — tracked periods
- `src/lib/budget/cycleCompletion.ts` — completion detection and copy

Tests: `src/lib/budget/budget.test.ts`, `src/lib/budget/positions.test.ts`.
