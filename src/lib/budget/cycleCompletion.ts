import { addDays, getPayCycle, startOfDay } from "./payCycles";
import { computeManualPositionCents } from "./positions";
import type {
  BudgetSettingsInput,
  ManualSpendInput,
  PayCycle,
} from "./types";

export interface CycleCompletionState {
  pending: boolean;
  completedPayCycle: PayCycle;
  positionCents: number;
  isUnderLine: boolean;
  title: string;
  headline: string;
  subline: string;
}

export function getCompletedPayCycleForReference(
  settings: BudgetSettingsInput,
  referenceDate: Date
): PayCycle {
  const current = getPayCycle(
    settings.incomeFrequency,
    settings.nextPayday,
    referenceDate
  );
  const lastDayOfPrevious = addDays(current.start, -1);
  return getPayCycle(
    settings.incomeFrequency,
    settings.nextPayday,
    lastDayOfPrevious
  );
}

/**
 * True when reference is in a new pay cycle (differs from yesterday’s cycle).
 * Shows from the first day after the previous cycle ended until marked complete (future).
 */
export function isPendingPayCycleCompletion(
  referenceDate: Date,
  settings: BudgetSettingsInput
): boolean {
  const current = getPayCycle(
    settings.incomeFrequency,
    settings.nextPayday,
    referenceDate
  );
  const previousCycle = getPayCycle(
    settings.incomeFrequency,
    settings.nextPayday,
    addDays(referenceDate, -1)
  );

  if (previousCycle.start.getTime() === current.start.getTime()) {
    return false;
  }

  return (
    startOfDay(referenceDate).getTime() >
    startOfDay(previousCycle.end).getTime()
  );
}

export function buildCycleCompletionState(
  settings: BudgetSettingsInput,
  manualDailyTargetCents: number,
  manualSpends: ManualSpendInput[],
  trackingStartDate: Date,
  referenceDate: Date,
  currentPayCycle: PayCycle,
  formatAmount: (cents: number) => string
): CycleCompletionState | null {
  if (!isPendingPayCycleCompletion(referenceDate, settings)) {
    return null;
  }

  const completedPayCycle = getCompletedPayCycleForReference(
    settings,
    referenceDate
  );
  const { positionCents } = computeManualPositionCents(
    manualDailyTargetCents,
    manualSpends,
    completedPayCycle.start,
    completedPayCycle.end,
    trackingStartDate
  );

  const isUnderLine = positionCents >= 0;
  const amountLabel = formatAmount(Math.abs(positionCents));

  if (isUnderLine) {
    return {
      pending: true,
      completedPayCycle,
      positionCents,
      isUnderLine: true,
      title: "Pay cycle complete",
      headline: `You finished ${amountLabel} under the line.`,
      subline:
        "Move it to savings or investments, then start the next cycle.",
    };
  }

  return {
    pending: true,
    completedPayCycle,
    positionCents,
    isUnderLine: false,
    title: "Pay cycle complete",
    headline: `You finished ${amountLabel} over the line.`,
    subline: "Reset today. Beat the next cycle.",
  };
}
