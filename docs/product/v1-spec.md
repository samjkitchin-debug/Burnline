# Burnline v1 product spec

## Core promise

Know what you can spend today and still hit your savings goal.

## Core habit

Enter every spend. Beat today. Repeat tomorrow.

## Product loop

1. Beat today.
2. Beat tomorrow.
3. Get through the **pay cycle** under the line.
4. At pay cycle end, mark the cycle complete, protect/move savings, then start the next cycle.

**Today** is the main screen. **Pay-cycle position** is the main progress target. **Year position** is a secondary scoreboard only.

## Target user

High-income person with predictable income, meaningful fixed costs, lifestyle creep, and a serious savings target. Wants a clear daily spend ceiling, not a budgeting dashboard.

## Primary question

“Am I burning money faster than my savings goal allows?”

## v1 guardrails (do not build)

Bank sync, AI coach, receipt scanning, finance dashboards, pie charts, category budgets, net worth, investments, debt planners, CSV imports, multi-currency, shared household budgets, subscription detection, merchant DB, streaks, badges, tax calculators, bank/investment transfers on cycle complete.

## Visual brand (v1)

- **Brand:** deep navy (`--brand-blue`) and gold (`--accent-gold`) — sausage family; see `docs/design/tokens.md`.
- **Green / red:** semantic status on Today only (on track / over line), not primary chrome.
- **Today screen is sacred:** two hero numbers, one primary CTA, no charts.

## Hero experience (Today)

**Two hero numbers** (whole dollars):

1. **Spent today** — fixed daily burn + manual spends entered today
2. **Today’s line** — fixed daily burn + manual spend allowance (`maxToday` in engine)

Supporting line:

- On track: `$X under the line.`
- Over: `$X over today’s line. Beat tomorrow to pull it back.`

A simple in-card progress bar shows spent vs line (capped at 100% visually); no chart library.

Savings is **protected money**, not spend. It appears in the hero’s collapsible **Why $X?** disclosure (collapsed by default) but is not included in spent today.

## Pay cycle position (primary progress)

Card title: **Pay cycle position**

When at least one tracked day exists in the current pay cycle (including day 1):

- `$X under the line` or `$X over the line`
- `Y days left` in the pay cycle (remaining local calendar days **after today** until cycle end — separate from tracked days)
- Supporting: **Keep beating the day.** / **Beat tomorrow to pull it back.**

On the **first day of tracking** with no manual spend, pay-cycle position equals today’s manual allowance (same as today’s remaining buffer when only fixed burn applies).

Use **under/over the line** — not “ahead/behind”.

## Year position (secondary)

Smaller row under pay cycle position:

- **This year: $Y under/over the line**
- **Measured from tracked days.**

Must not match visual weight of pay cycle position.

## Pay cycle completion (v1)

When the date is **after** the previous pay cycle ended (on or after the next pay cycle start), the completed cycle is ready to close.

**Under the line:**

- Pay cycle complete
- You finished $X under the line.
- Move it to savings or investments, then start the next cycle.

**Over the line:**

- Pay cycle complete
- You finished $X over the line.
- Reset today. Beat the next cycle.

v1: no bank/investment integration. UI shows completion copy and a disabled **Mark cycle complete** placeholder until persistence exists.

## Key screens

| Route | Purpose |
|-------|---------|
| `/today` | Hero, pay cycle position, entries; **+ Add spend** opens a bottom sheet (modal-first) |
| `/today/add` | Fallback full-page Add spend (same form; deep link, smoke tests) |
| `/fixed-costs` | Bill streams and fixed daily burn |
| `/settings` | Income, savings, currency, account |
| `/onboarding` | Income → savings → fixed costs → result |
| `/about`, `/how-it-works`, `/privacy`, `/security`, `/terms`, `/contact` | Public info pages (hamburger + Settings links) |

## Add spend (low friction)

- On **Today**, **+ Add spend** opens a mobile-first bottom sheet (`<dialog>`) over the screen — no navigation for the normal path.
- Amount, category pills, optional note; bill treatments when category/amount warrants it.
- After a successful save: sheet closes, **one** `router.refresh()` updates Today numbers, focus returns to **+ Add spend**.
- **`/today/add`** remains for direct URL, smoke tests, and fallback (renders the same `AddSpendForm` in the app shell).

## Spend treatment

1. **count_today_only** — manual spend; hits today.
2. **spread_as_recurring_bill** — bill stream + payment; updates fixed daily burn; not manual spend.
3. **already_included** — no budget impact.

## Terminology

| Term | Meaning |
|------|---------|
| Pay cycle | Income-aligned period (calendar dates; see calculation engine) |
| Fixed daily burn | Recurring fixed costs spread per day (bill streams) |
| Savings daily target | Protected savings per day — **not spend** |
| Manual daily target | Discretionary spend allowance per day |
| Spent today | Fixed daily burn + manual spends today |
| Today’s line | Fixed daily burn + manual daily target |
| Pay cycle position | Manual allowance vs manual spend on **tracked days** in the pay cycle |
| Year position | Same model for the calendar year from tracked days only |
| Financial timezone | IANA zone on `profiles.timezone` — decides when each spending day starts. Device timezone is only the onboarding default. |
| Tracking start | Earliest manual spend; else `profiles.tracking_start_date` (set on onboarding complete); else today in financial timezone. Do not infer from UTC `created_at`. |

## Touch targets

- Primary **+ Add spend**: ≥ 48px height (implemented ~52px)
- Bottom nav: comfortable tap targets with safe-area padding

## Success metric for v1

User can log in, complete onboarding, beat today repeatedly, see pay cycle position build over tracked days, and understand year position as a secondary scoreboard.
