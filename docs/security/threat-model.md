# Threat model (v1)

Realistic threats for a personal finance web app on Supabase + Next.js. For each: **mitigation today**, **remaining risk**, **future hardening**.

---

## Cross-user data access

### T1 — User reads another user’s financial rows

| | |
|-|-|
| **Mitigation** | RLS `user_id = auth.uid()` on all user tables; profiles `id = auth.uid()`; queries scoped in loaders |
| **Remaining** | Misconfigured policy or RLS disabled in a migration |
| **Future** | Automated RLS regression tests; policy review on every migration |

### T2 — Broken RLS exposes all rows

| | |
|-|-|
| **Mitigation** | RLS enabled in initial migration; [RLS policy review](rls-policy-review.md) |
| **Remaining** | Human error in new tables/policies |
| **Future** | CI check that new tables enable RLS |

---

## Linked-resource attacks

### T3 — `bill_payment` attached to another user’s `bill_stream`

| | |
|-|-|
| **Mitigation** | RLS insert/update `WITH CHECK` verifies `bill_streams.user_id = auth.uid()`; server `requireOwnedBillStream()` |
| **Remaining** | Server action bypass if a new code path skips ownership check |
| **Future** | Integration test: user B cannot pay user A’s stream |

---

## Credential and secret leakage

### T4 — Leaked `.env.local` or service role key

| | |
|-|-|
| **Mitigation** | `.env.local` gitignored; `*.zip` gitignored; README warns; no service role in app; `requirePublicEnv()` only allows anon + URL |
| **Remaining** | Developer shares zip/repo screenshot with keys; service role used in ad-hoc scripts |
| **Future** | Secret scanning in CI; pre-commit hooks |

### T5 — Service role in user-facing code

| | |
|-|-|
| **Mitigation** | Grep policy: no `SERVICE_ROLE` in `src/`; docs forbid it |
| **Remaining** | Future contributor adds admin script to app bundle |
| **Future** | Lint rule or CI grep |

---

## Logging and observability

### T6 — Sensitive data in logs

| | |
|-|-|
| **Mitigation** | [Logging redaction](logging-redaction.md); `authLog()` structured events only; no financial `console.log` in `src/` |
| **Remaining** | Vercel/runtime errors might include query params; Supabase dashboard logs |
| **Future** | Central log scrubbing; error reporting without PII |

---

## Injection and XSS

### T7 — XSS via spend/bill notes

| | |
|-|-|
| **Mitigation** | React default escaping; no `dangerouslySetInnerHTML` in codebase; notes stored as text |
| **Remaining** | Future UI that renders HTML or markdown from notes |
| **Future** | CSP; sanitise if rich text ever added |

### T8 — CSRF / forged server actions

| | |
|-|-|
| **Mitigation** | Next.js server actions with session cookies; mutations require authenticated Supabase client |
| **Remaining** | CSRF on cookie-auth endpoints (framework-dependent) |
| **Future** | Review Next.js CSRF posture; SameSite cookie settings in Supabase |

---

## Auth and redirects

### T9 — Open redirect via `next` parameter

| | |
|-|-|
| **Mitigation** | `sanitizeNext()` — internal paths only, rejects `://` and `//` |
| **Remaining** | Path allowlist not enforced (any internal path) |
| **Future** | Allowlist `/today`, `/onboarding`, etc. |

### T10 — Stale session / surprise logout

| | |
|-|-|
| **Mitigation** | Middleware refreshes session; guards redirect to login |
| **Remaining** | UX confusion, not confidentiality breach |
| **Future** | Clear session-expired messaging |

---

## Integrity and availability

### T11 — Data loss from delete/update bugs

| | |
|-|-|
| **Mitigation** | Limited delete UI in v1; updates scoped by `user_id` |
| **Remaining** | Accidental overwrite of settings |
| **Future** | Soft delete; audit trail for settings changes |

### T12 — Accidental public sharing (screenshots, repo zips)

| | |
|-|-|
| **Mitigation** | Docs warn: no `.env` in zips; `*.zip` gitignored |
| **Remaining** | User behaviour |
| **Future** | Security tips in onboarding footer |

---

## Future product risks

### T13 — Analytics captures financial fields

| | |
|-|-|
| **Mitigation** | No analytics SDK in v1 |
| **Remaining** | Added without review |
| **Future** | Privacy review gate before any tracker |

### T14 — Daily budget snapshots if settings change

| | |
|-|-|
| **Mitigation** | Not implemented in v1; documented in calculation engine as future need |
| **Remaining** | Historical inaccuracy or over-retention when built |
| **Future** | Snapshot privacy review; retention limits |

### T15 — Bank sync expands attack surface

| | |
|-|-|
| **Mitigation** | Explicit v1 non-goal |
| **Remaining** | N/A in v1 |
| **Future** | Separate threat model for aggregators |
