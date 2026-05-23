export const SPEND_CATEGORIES = [
  "Food",
  "Coffee",
  "Groceries",
  "Transport",
  "Bills",
  "Shopping",
  "Family",
  "Health",
  "Fun",
  "Other",
] as const;

export const BILL_CATEGORIES = [
  "Housing",
  "Utilities",
  "Insurance",
  "Subscriptions",
  "Tax",
  "Childcare",
  "Transport",
  "Other",
] as const;

export const CURRENCIES = ["SGD", "USD", "AUD", "GBP", "EUR"] as const;

/** Curated IANA timezones for Financial timezone settings (v1). */
export const PROFILE_TIMEZONES = [
  "Asia/Singapore",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "UTC",
] as const;

export type SpendCategory = (typeof SPEND_CATEGORIES)[number];
