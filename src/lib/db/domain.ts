import { z } from "zod";
import type {
  IncomeFrequency,
  RecurringFrequency,
  SavingsFrequency,
} from "@/lib/budget/types";
import { DEFAULT_TIMEZONE, normalizeTimezone } from "@/lib/dates/timezone";

export const incomeFrequencySchema = z.enum([
  "weekly",
  "fortnightly",
  "monthly",
]);

export const savingsFrequencySchema = z.enum([
  "weekly",
  "fortnightly",
  "monthly",
  "annually",
]);

export const recurringFrequencySchema = z.enum([
  "weekly",
  "fortnightly",
  "monthly",
  "quarterly",
  "annually",
]);

const currencySchema = z
  .string()
  .trim()
  .min(3)
  .max(3)
  .transform((v) => v.toUpperCase());

export function parseIncomeFrequency(value: unknown): IncomeFrequency {
  return incomeFrequencySchema.parse(value);
}

export function parseSavingsFrequency(value: unknown): SavingsFrequency {
  return savingsFrequencySchema.parse(value);
}

export function parseRecurringFrequency(value: unknown): RecurringFrequency {
  return recurringFrequencySchema.parse(value);
}

export function parseCurrency(value: unknown, fallback = "SGD"): string {
  const parsed = currencySchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function parseProfileTimezone(value: unknown): string {
  return normalizeTimezone(
    typeof value === "string" ? value : DEFAULT_TIMEZONE
  );
}
