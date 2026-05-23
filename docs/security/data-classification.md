# Data classification

Classification levels used in Burnline:

| Level | Definition |
|-------|------------|
| **Public** | Non-user app assets (marketing copy, open-source code without secrets) |
| **Internal** | Operational metadata not tied to a identifiable user’s finances |
| **Confidential** | Account metadata that identifies or configures a user account |
| **Restricted** | Personal financial data and free-text that may reveal lifestyle, housing, tax, or debt context |

Retention expectation for v1: data kept until the user deletes their account (future) or the Supabase project owner removes it. No automated expiry in v1.

---

## profiles

| Field | Sensitivity | Financial | Free-text | Purpose |
|-------|-------------|-----------|-----------|---------|
| `id` | Confidential | No | No | Link to `auth.users` |
| `currency` | Confidential | Context | No | Display and calculation currency |
| `timezone` | Confidential | No | No | Financial timezone — local calendar day for “today” |
| `tracking_start_date` | Confidential | No | No | First tracked local day for pay-cycle position |
| `created_at` / `updated_at` | Confidential | No | No | Audit timestamps |

**Privacy risks:** currency + timezone can infer region; low alone, combines with Restricted tables for strong profiling.

---

## budget_settings

| Field | Sensitivity | Financial | Free-text | Purpose |
|-------|-------------|-----------|-----------|---------|
| `user_id` | Confidential | No | No | Ownership |
| `income_amount_cents` | **Restricted** | Yes | No | Pay-cycle income input |
| `income_frequency` | Confidential | Context | No | Weekly / fortnightly / monthly |
| `next_payday` | **Restricted** | Yes | No | Pay cycle boundaries |
| `created_at` / `updated_at` | Confidential | No | No | Timestamps |

**Privacy risks:** income and payday reveal earning level and pay rhythm.

---

## savings_targets

| Field | Sensitivity | Financial | Free-text | Purpose |
|-------|-------------|-----------|-----------|---------|
| `user_id` | Confidential | No | No | Ownership (unique per user in v1) |
| `amount_cents` | **Restricted** | Yes | No | Savings goal amount |
| `frequency` | Confidential | Context | No | How savings is expressed |
| `created_at` / `updated_at` | Confidential | No | No | Timestamps |

**Privacy risks:** savings target reveals wealth-building intent and scale.

---

## bill_streams

| Field | Sensitivity | Financial | Free-text | Purpose |
|-------|-------------|-----------|-----------|---------|
| `user_id` | Confidential | No | No | Ownership |
| `name` | **Restricted** | Yes | **Yes** | User label (e.g. “Rent”, “ATO”, “HECS”) |
| `category` | Confidential | Context | No | Grouping (Housing, Tax, etc.) |
| `frequency` | Confidential | Context | No | Recurring period |
| `estimated_amount_cents` | **Restricted** | Yes | No | Rolling estimate for fixed daily burn |
| `is_active` | Confidential | No | No | Include in burn or pause |
| `estimation_method` | Internal | No | No | Engine metadata |
| `created_at` / `updated_at` | Confidential | No | No | Timestamps |

**Privacy risks:** names and categories may expose housing cost, subscriptions, tax, childcare, or debt-related labels.

---

## bill_payments

| Field | Sensitivity | Financial | Free-text | Purpose |
|-------|-------------|-----------|-----------|---------|
| `user_id` | Confidential | No | No | Ownership |
| `bill_stream_id` | Confidential | No | No | Link to stream (RLS cross-check) |
| `amount_cents` | **Restricted** | Yes | No | Payment amount |
| `paid_on` | Confidential | Context | No | Payment date |
| `note` | **Restricted** | Yes | **Yes** | Optional payment note |
| `created_at` | Confidential | No | No | Timestamp |

**Privacy risks:** notes may contain merchant or personal details; amounts reveal bill history.

---

## manual_spends

| Field | Sensitivity | Financial | Free-text | Purpose |
|-------|-------------|-----------|-----------|---------|
| `user_id` | Confidential | No | No | Ownership |
| `amount_cents` | **Restricted** | Yes | No | Spend amount |
| `category` | Confidential | Context | No | Food, Bills, etc. |
| `note` | **Restricted** | Yes | **Yes** | Optional spend note |
| `spent_on` | **Restricted** | Yes | No | User calendar day of spend |
| `created_at` / `updated_at` | Confidential | No | No | Timestamps |

**Privacy risks:** notes are highest XSS/display risk if rendered unsafely; amounts + dates enable spending behaviour inference.

---

## auth.users (Supabase managed)

| Data | Sensitivity | Notes |
|------|-------------|--------|
| Email | Confidential | Auth identifier; not stored in app tables |
| Password hash | Restricted | Supabase Auth only; never in app logs |

---

## Not stored (v1)

- Bank credentials, account numbers, transactions feed  
- Receipt images  
- Precise geolocation  
- Device advertising IDs  
- Third-party analytics events  
