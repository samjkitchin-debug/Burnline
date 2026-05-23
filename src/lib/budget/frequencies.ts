import type {
  IncomeFrequency,
  RecurringFrequency,
  SavingsFrequency,
} from "./types";

/** Convert a recurring amount to daily cents using annualised formulas. */
export function annualiseToDailyCents(
  amountCents: number,
  frequency: RecurringFrequency | SavingsFrequency | IncomeFrequency
): number {
  const multiplier = getAnnualisationMultiplier(frequency);
  return Math.round((amountCents * multiplier) / 365);
}

function getAnnualisationMultiplier(
  frequency: RecurringFrequency | SavingsFrequency | IncomeFrequency
): number {
  switch (frequency) {
    case "weekly":
      return 52;
    case "fortnightly":
      return 26;
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "annually":
      return 1;
    default: {
      const _exhaustive: never = frequency;
      return _exhaustive;
    }
  }
}
