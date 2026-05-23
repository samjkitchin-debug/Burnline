# Navigation

## Primary navigation (v1)

**Bottom bar** — fixed, three items only:

- Today (`/today`)
- Fixed costs (`/fixed-costs`)
- Settings (`/settings`)

Active state: soft gold pill (`--nav-active-bg`), brand blue label, subtle gold border. Inactive: muted text, transparent background.

Implementation: `src/components/ui/AppShell.tsx`.

## Top header

**Left:** Burnline name + current section label (e.g. Today, Privacy).

**Right:** Hamburger menu (`src/components/navigation/HamburgerMenu.tsx`).

Used on:

- App shell pages (via `AppHeader` inside `AppShell`)
- Info pages (`InfoPageLayout`)
- Login and onboarding (no bottom nav)

## Hamburger menu

**App info** (always):

- How it works, About, Privacy, Security, Terms, Contact

**App** section (optional `showAppLinks`):

- Today, Fixed costs, Settings — shown on info/login-style layouts, omitted on app shell pages where bottom nav is visible.

**Log in** — shown when signed out.

Accessibility: `aria-label`, `aria-expanded`, Escape closes, click-outside closes, keyboard-focusable links, visible focus rings.

## Add spend

Modal-first from Today (`TodayAddSpend`); `/today/add` remains a fallback full page.

## Do not add

- Extra bottom nav items
- Centre FAB
- Dark/heavy nav chrome
- Green as nav brand colour
