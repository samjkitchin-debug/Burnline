# Burnline — local smoke test

Manual checklist for validating v1 on **http://localhost:3000** after Supabase migration and `.env.local` are configured.

Allow 15–20 minutes. Use a dedicated test email you control.

## Before you start

- [ ] Migrations applied (initial schema + `20260523120000_profile_timezone_savings_unique.sql` + `20260523130000_profile_tracking_start_date.sql`)
- [ ] `.env.local` has valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `npm run dev` running without errors
- [ ] Email/password auth enabled in Supabase dashboard

## Info pages (public)

- [ ] Signed out: open `/privacy`, `/about`, `/how-it-works` — no login required
- [ ] Hamburger on info pages includes **Log in** when signed out; **App** section links when signed in
- [ ] `/security` and `/terms` state no ISO certification; no bank sync / no data sale in v1
- [ ] `/contact` shows support email pending (no fake address)

## Auth

- [ ] Open `/login`
- [ ] **Sign up** with test email + password
- [ ] Land on onboarding (not stuck on login)
- [ ] **Log out** from Settings
- [ ] **Log in** again with same credentials — session works, no surprise logout

## Onboarding

- [ ] **Income:** amount, frequency, next payday, currency — continue
- [ ] **Savings target:** amount + frequency — continue
- [ ] **Fixed costs:** add at least one bill stream (e.g. Rent, monthly)
- [ ] **Summary:** shows manual daily target, fixed costs/day, savings/day
- [ ] **Start today** → `/today` (sets `profiles.tracking_start_date` if unset)

## Today screen

- [ ] Small header: **Burnline** / **Today**
- [ ] Hero shows two numbers: **Spent today** and **Today’s line** (whole dollars, navy + gold)
- [ ] Progress bar under hero (no chart); fills with brand blue; gold marker at line
- [ ] On track: green-tinted status “$X under the line.”; over: red-tinted “$X over today’s line…”
- [ ] **+ Add spend** is the only dominant button (brand blue, ≥ 48px tall)
- [ ] Hero **Why $X?** disclosure (collapsed by default): expand to see fixed costs, extra you can spend, today’s line, savings protected
- [ ] **Pay cycle position** card (primary): under/over the line + days left when enough tracked data
- [ ] First day: pay-cycle position matches today’s manual buffer (e.g. $169 under the line with no spend)
- [ ] Secondary row: “This year: …” smaller than pay cycle position; “Measured from tracked days.”
- [ ] On first day of a new pay cycle (if testable): completion banner + disabled “Mark cycle complete”
- [ ] Bottom nav: Today / Fixed costs / Settings only; selected tab uses soft gold pill + navy text
- [ ] Top right **hamburger** opens menu; Escape / outside click closes; links to How it works, About, Privacy, Security, Terms, Contact
- [ ] **Settings → App info** lists the same pages
- [ ] Warm paper app background; cards ~20px radius; 20px screen padding
- [ ] “Today’s entries” empty or listed correctly

## Manual spend (modal-first)

- [ ] On **Today**, tap **+ Add spend** — bottom sheet opens (no full-page navigation)
- [ ] **Cancel** closes the sheet; Today unchanged
- [ ] Enter small amount, category **Food**, **Save spend** — sheet closes; Today stays on `/today`
- [ ] Hero **spent today** and **Today’s entries** update without a full-page transition
- [ ] Validation error (e.g. invalid amount) stays in the sheet; typed amount retained

### Fallback route

- [ ] Open **`/today/add` directly** (signed in) — full page with same form in app shell
- [ ] Save spend → returns to Today (page mode navigation)
- [ ] Signed out: **`/today/add`** → `/login?next=...` preserving path

## Bill-like spend treatments

### Spread as recurring bill

- [ ] From Today sheet: add spend with category **Bills** or amount ≥ ~50% of daily target
- [ ] Choose **Spread as recurring bill**
- [ ] Set frequency, create or pick stream, confirm
- [ ] Confirmation mentions fixed daily burn (~ $X/day)
- [ ] Spent today increases when adding manual spend; today’s line stays stable
- [ ] Fixed costs / bill streams reflect in spent today via fixed daily burn

### Already included

- [ ] Add another bill-like spend
- [ ] Choose **Already included**
- [ ] See “Already covered” message
- [ ] Spent today / line status **unchanged** by that amount

## Fixed costs

- [ ] Open **Fixed costs**
- [ ] Bill stream from onboarding visible with ~ $/day
- [ ] **Add payment** on existing stream with new amount
- [ ] Return to Today — daily burn reflects updated estimate (may need refresh)

## Settings

- [ ] Open **Settings** — income and savings values match onboarding
- [ ] **Financial timezone** shows stored zone; help text visible; save a different zone — no error
- [ ] Return to Today — still loads

## Regression quick checks

- [ ] `npm test` — calculation tests pass
- [ ] `npm run lint` and `npm run build` pass after UI changes
- [ ] No console errors on Today after normal spend flow

## Sign-off

| Result | Notes |
|--------|--------|
| Pass / Fail | |
| Tester | |
| Date | |
| Commit / branch | |

If any step fails, note the route, action, and expected vs actual behaviour before fixing or filing an issue.
