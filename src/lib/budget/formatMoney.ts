const WHOLE_DOLLAR_THRESHOLD_CENTS = 100;

/** Display whole dollars; negative only when magnitude >= $1. */
export function toDisplayWholeDollarsCents(amountCents: number): number {
  if (amountCents >= 0) {
    return Math.floor(amountCents / WHOLE_DOLLAR_THRESHOLD_CENTS) *
      WHOLE_DOLLAR_THRESHOLD_CENTS;
  }
  if (amountCents <= -WHOLE_DOLLAR_THRESHOLD_CENTS) {
    return Math.ceil(amountCents / WHOLE_DOLLAR_THRESHOLD_CENTS) *
      WHOLE_DOLLAR_THRESHOLD_CENTS;
  }
  return 0;
}

export function isTodayRed(remainingTodayCents: number): boolean {
  return toDisplayWholeDollarsCents(remainingTodayCents) < 0;
}

/** Over when displayed spent exceeds displayed max, or displayed remaining is negative */
export function isTodayOver(
  spentTodayCents: number,
  maxTodayCents: number,
  remainingTodayCents: number
): boolean {
  const spentDisplay = toDisplayWholeDollarsCents(spentTodayCents);
  const maxDisplay = toDisplayWholeDollarsCents(maxTodayCents);
  const remainingDisplay = toDisplayWholeDollarsCents(remainingTodayCents);
  return spentDisplay > maxDisplay || remainingDisplay < 0;
}

export function formatMoney(
  amountCents: number,
  currency: string,
  options?: { showSign?: boolean; wholeDollars?: boolean }
): string {
  const cents = options?.wholeDollars
    ? toDisplayWholeDollarsCents(amountCents)
    : amountCents;
  const amount = cents / 100;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency,
    minimumFractionDigits: options?.wholeDollars ? 0 : 2,
    maximumFractionDigits: options?.wholeDollars ? 0 : 2,
  }).format(abs);

  if (cents < 0) {
    return options?.showSign === false ? `-${formatted}` : `-${formatted}`;
  }
  return formatted;
}

export function formatDailyAmount(
  amountCents: number,
  currency: string
): string {
  return `${formatMoney(amountCents, currency, { wholeDollars: true })}/day`;
}
