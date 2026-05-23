# Boilerplate / info pages

Plain-English trust and product pages for early Burnline. **Not lawyer-reviewed final legal documents.**

## Routes

| Route | Public | Purpose |
|-------|--------|---------|
| `/about` | Yes | Product story and what Burnline is not |
| `/how-it-works` | Yes | Setup loop and maths in plain English |
| `/privacy` | Yes | Data collected, not collected, use, posture |
| `/security` | Yes | RLS, least privilege, ISO-inspired (not certified) |
| `/terms` | Yes | Disclaimer and acceptable use (draft) |
| `/contact` | Yes | Support placeholder before public launch |

Protected routes unchanged: `/today`, `/fixed-costs`, `/settings`, `/onboarding`, `/today/add`.

No auth guard on info routes — readable before signup.

## Navigation

- **Hamburger menu** (top right): `AppHeader` + `HamburgerMenu` on app shell, info pages, login, onboarding.
- On **app shell** pages (Today, Fixed costs, Settings): menu shows **App info** links only (bottom nav covers main app routes).
- On **info / login** pages: menu shows app info links + divider + Today / Fixed costs / Settings when useful; **Log in** when signed out.
- **Settings → App info**: duplicate links to the same pages for discoverability.

Bottom nav remains **three items only**: Today, Fixed costs, Settings.

## Tone rules

- Direct, plain English, slightly candid
- No corporate “financial wellness” fluff
- No AI money coach framing
- No overclaiming (no ISO certification, no bank sync v1, no data sale, no guaranteed savings)
- Green/red are **not** brand colours on these pages (semantic status only elsewhere)

## Implementation

- Layout: `src/components/info/InfoPageLayout.tsx`
- Copy: `src/app/{about,how-it-works,privacy,security,terms,contact}/page.tsx`
- Links: `src/lib/navigation/infoLinks.ts`
- Last updated string: `INFO_LAST_UPDATED` in `infoLinks.ts`
