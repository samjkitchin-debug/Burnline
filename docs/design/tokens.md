# Burnline design tokens

Visual system for v1. Brand colours come from the **sausage** family (deep navy + gold) used in the footy tipping app; semantic greens and reds are **not** brand colours.

## Brand (primary UI)

| Token | CSS variable | Role |
|-------|----------------|------|
| Brand blue | `--brand-blue` | Primary CTA, hero “Spent today” number, headings |
| Brand blue soft | `--brand-blue-soft` | Progress track, secondary surfaces |
| Accent gold | `--accent-gold` | “Today’s line” number, line marker on progress |
| Accent gold soft | `--accent-gold-soft` | Active bottom nav pill background (`--nav-active-bg`) |

> **TODO:** Replace `--brand-blue` and `--accent-gold` hex values in `src/app/globals.css` with exact sausage/the-club values when available from that codebase.

Current placeholders (navy + gold):

- `--brand-blue`: `#0f2744`
- `--brand-blue-soft`: `#e8edf5`
- `--accent-gold`: `#c9a227`
- `--accent-gold-soft`: `#f5edd6`

## Surfaces and text

| Token | Role |
|-------|------|
| `--surface` | App background (warm paper / off-white) |
| `--paper` | Card background |
| `--border-subtle` | Card and list borders |
| `--text-strong` | Primary copy |
| `--text-muted` | Secondary copy |

## Bottom navigation (primary nav, v1)

Three items only: **Today**, **Fixed costs**, **Settings**. No centre FAB, no extra routes, no icons in v1.

| Token | Maps to | Role |
|-------|---------|------|
| `--nav-surface` | `--paper` | Warm nav bar background |
| `--nav-border` | `--border-subtle` | Top edge divider |
| `--nav-shadow` | (custom) | Soft upward shadow |
| `--nav-active-bg` | `--accent-gold-soft` | Active pill background |
| `--nav-active-text` | `--brand-blue` | Active label (semibold) |
| `--nav-inactive-text` | `--text-muted` | Inactive labels |

**Active state:** soft gold pill, brand blue text, subtle gold border, light shadow. **Inactive:** muted slate/navy text, transparent; hover uses soft brand-blue wash. **Do not** use `--positive` / `--danger` on nav — green/red are semantic status only.

Implementation: `src/components/ui/AppShell.tsx`. Main content uses bottom padding so lists (e.g. Today’s entries) clear the fixed bar and safe area.

## Semantic status only

| Token | Role |
|-------|------|
| `--positive` / `--positive-soft` | On track (under today’s line) |
| `--danger` / `--danger-soft` | Over today’s line (recoverable warning) |

Do **not** use green as the primary brand colour. Do **not** use red for generic errors on the Today hero — reserve it for over-line state.

## Layout

| Token / rule | Value |
|--------------|--------|
| `--space-screen` | 20px horizontal padding |
| `--space-card-gap` | 16px vertical gap between blocks |
| `--radius-card` | ~20px card radius |
| `--radius-button` | 14px primary button |
| Max width | `max-w-md` mobile shell |
| Safe area | Nav ~64px (`min-h-16`) + 12px vertical padding + `env(safe-area-inset-bottom)`; main `pb` clears the bar |

## Today screen hierarchy

1. Small header: **Burnline** / **Today**
2. Hero card: **Spent today** + **Today’s line**, progress bar, status line, collapsible **Why $X?** disclosure (collapsed by default; no separate explanation card)
3. Primary action: **+ Add spend** (only dominant button)
4. Pay cycle position (quieter when tracking starts)
5. Today’s entries list

## Accessibility

- Primary button: min height 52px, bold label, visible `focus-visible` ring
- Bottom nav links: min height 44px (`min-h-11`), full-width flex cells, `focus-visible` ring with offset on nav surface
- Status lines include screen-reader prefix (“Under line” / “Over line”) — not colour alone
- Hero amounts use `tabular-nums` where practical

## Guardrails

- Daily spend speedometer, not a finance dashboard
- No charts on Today
- No extra nav items (Today / Fixed costs / Settings only); nav is not dark/heavy

Implementation: `src/app/globals.css`, shared UI in `src/components/ui/`, Today-specific blocks in `src/components/today/`.
