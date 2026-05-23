const DOLLARS_PATTERN = /^\d+(\.\d{1,2})?$/;

export class MoneyParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyParseError";
  }
}

/** Strict dollars → integer cents. Rejects 12abc, negatives, >2 decimal places. */
export function parseDollarsToCents(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new MoneyParseError("Amount is required");
  }
  if (!DOLLARS_PATTERN.test(trimmed)) {
    throw new MoneyParseError("Enter a valid amount (up to two decimal places)");
  }

  const [wholePart, fractionPart = ""] = trimmed.split(".");
  const whole = Number.parseInt(wholePart, 10);
  const fraction = Number.parseInt((fractionPart + "00").slice(0, 2), 10);

  if (!Number.isFinite(whole) || !Number.isFinite(fraction)) {
    throw new MoneyParseError("Enter a valid amount");
  }

  return whole * 100 + fraction;
}

export function parseDollarsToCentsSafe(
  value: string
): { cents: number } | { error: string } {
  try {
    return { cents: parseDollarsToCents(value) };
  } catch (error) {
    const message =
      error instanceof MoneyParseError
        ? error.message
        : "Enter a valid amount";
    return { error: message };
  }
}
