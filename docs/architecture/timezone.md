# Timezone and local calendar days

Burnline is a **daily** app. “Today” is the user’s **financial** calendar day in their chosen IANA timezone, not the server host’s UTC day and not necessarily the device clock while travelling.

## v1 strategy

1. **`profiles.timezone`** — source of truth (default `Asia/Singapore`). Label in UI: **Financial timezone**.
2. **Device timezone** — `Intl.DateTimeFormat().resolvedOptions().timeZone` on onboarding step 1 only; stored once unless the user edits Settings.
3. **`profiles.tracking_start_date`** — first local day the user began tracking; set when onboarding completes (`finalizeOnboardingAndStart`). Null for legacy users → app uses today in financial timezone (never UTC `created_at`).
4. **Server reference date** — `getUserReferenceDate()` → `getReferenceDateInTimezone(profiles.timezone)`.
5. **Manual spends** — client submits `spent_on` using `getTodayDateStringInTimezone(financialTimezone)`; server validates and falls back to profile “today” if missing.
6. **Avoid** `new Date().toISOString().slice(0, 10)` for user-facing dates.

Implementation: `src/lib/dates/timezone.ts`, `src/lib/profile/financial.ts`.

## Timestamps

`created_at` / `updated_at` remain UTC `timestamptz` — only **spent_on**, **tracking_start_date**, and budget “today” use local calendar logic.

## Future

- Optional “sync to device timezone” control (not v1).
- Historical snapshots if settings change mid-cycle.
