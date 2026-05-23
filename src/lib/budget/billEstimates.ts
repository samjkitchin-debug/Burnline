import type { BillPaymentInput, RecurringFrequency } from "./types";

const HISTORY_LIMIT: Record<RecurringFrequency, number> = {
  weekly: 4,
  fortnightly: 4,
  monthly: 3,
  quarterly: 2,
  annually: 1,
};

export function estimateBillStreamAmountCents(
  frequency: RecurringFrequency,
  initialEstimateCents: number,
  payments: BillPaymentInput[]
): number {
  const sorted = [...payments].sort(
    (a, b) => b.paidOn.getTime() - a.paidOn.getTime()
  );
  const limit = HISTORY_LIMIT[frequency];
  const recent = sorted.slice(0, limit);

  if (recent.length === 0) {
    return initialEstimateCents;
  }

  const total = recent.reduce((sum, p) => sum + p.amountCents, 0);
  return Math.round(total / recent.length);
}
