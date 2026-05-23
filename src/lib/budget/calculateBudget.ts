import { buildCycleCompletionState } from "./cycleCompletion";
import { annualiseToDailyCents } from "./frequencies";
import { formatMoney } from "./formatMoney";
import {
  computeManualPositionCents,
  getYearPeriodStart,
  hasEnoughPayCyclePositionData,
  manualSpendBeforeDateInPeriod,
} from "./positions";
import {
  getCycleIncomeCents,
  getPayCycle,
  getRemainingDaysAfterToday,
  startOfDay,
} from "./payCycles";
import type {
  BillStreamInput,
  BudgetCalculationInput,
  BudgetSnapshot,
  ManualSpendInput,
} from "./types";
import {
  isTodayOver,
  isTodayRed,
  toDisplayWholeDollarsCents,
} from "./formatMoney";

function sumActiveBillDailyBurn(billStreams: BillStreamInput[]): number {
  return billStreams
    .filter((b) => b.isActive)
    .reduce(
      (sum, stream) =>
        sum +
        annualiseToDailyCents(
          stream.estimatedAmountCents,
          stream.frequency
        ),
      0
    );
}

function manualSpendOnDate(
  spends: ManualSpendInput[],
  date: Date
): number {
  const target = startOfDay(date).getTime();
  return spends
    .filter((s) => startOfDay(s.spentOn).getTime() === target)
    .reduce((sum, s) => sum + s.amountCents, 0);
}

export function calculateBudget(
  input: BudgetCalculationInput
): BudgetSnapshot {
  const ref = startOfDay(input.referenceDate);
  const { settings, savings, billStreams, manualSpends, currency } = input;
  const trackingStartDate = startOfDay(input.trackingStartDate);

  const payCycle = getPayCycle(
    settings.incomeFrequency,
    settings.nextPayday,
    ref
  );

  const cycleIncomeCents = getCycleIncomeCents(settings.incomeAmountCents);

  const dailySavingsTargetCents = annualiseToDailyCents(
    savings.amountCents,
    savings.frequency
  );
  const fixedDailyBurnCents = sumActiveBillDailyBurn(billStreams);

  const cycleSavingsTargetCents = Math.round(
    dailySavingsTargetCents * payCycle.days
  );
  const cycleFixedBurnCents = Math.round(
    fixedDailyBurnCents * payCycle.days
  );

  const manualDailyTargetCents = Math.round(
    (cycleIncomeCents -
      cycleSavingsTargetCents -
      cycleFixedBurnCents) /
      payCycle.days
  );

  const todayManualSpendCents = manualSpendOnDate(manualSpends, ref);
  const spentTodayCents = fixedDailyBurnCents + todayManualSpendCents;
  const maxTodayCents = fixedDailyBurnCents + manualDailyTargetCents;
  const remainingTodayCents = maxTodayCents - spentTodayCents;
  const spentTodayDisplayCents = toDisplayWholeDollarsCents(spentTodayCents);
  const maxTodayDisplayCents = toDisplayWholeDollarsCents(maxTodayCents);
  const remainingTodayDisplayCents = toDisplayWholeDollarsCents(
    remainingTodayCents
  );
  const todayOver = isTodayOver(
    spentTodayCents,
    maxTodayCents,
    remainingTodayCents
  );

  const todayRemainingCents = remainingTodayCents;
  const todayRemainingDisplayCents = remainingTodayDisplayCents;

  const remainingDaysAfterToday = getRemainingDaysAfterToday(
    payCycle.end,
    ref
  );

  const payCycleTracked = computeManualPositionCents(
    manualDailyTargetCents,
    manualSpends,
    payCycle.start,
    ref,
    trackingStartDate
  );

  const payCyclePositionCents = payCycleTracked.positionCents;
  const manualAllowedToDateCents = payCycleTracked.allowedCents;
  const manualSpendToDateCents = payCycleTracked.spendCents;
  const payCycleTrackedStart = payCycleTracked.trackedStart;
  const payCycleTrackedDays = payCycleTracked.trackedDays;
  const elapsedCycleDaysIncludingToday = payCycleTrackedDays;

  const hasPayCyclePositionData = hasEnoughPayCyclePositionData(
    payCycle.start,
    trackingStartDate,
    ref
  );

  const manualSpendBeforeTodayCents = manualSpendBeforeDateInPeriod(
    manualSpends,
    payCycleTrackedStart,
    ref
  );
  const hasManualSpendHistoryBeforeToday = manualSpendBeforeTodayCents > 0;

  const yearTrackedStart = getYearPeriodStart(ref, trackingStartDate);
  const yearTracked = computeManualPositionCents(
    manualDailyTargetCents,
    manualSpends,
    yearTrackedStart,
    ref,
    trackingStartDate
  );
  const yearPositionCents = yearTracked.positionCents;
  const yearTrackedDays = yearTracked.trackedDays;
  const hasYearPositionData = yearTrackedDays > 0 && hasPayCyclePositionData;

  let dailyRecoveryRequiredCents: number | null = null;
  if (payCyclePositionCents < 0 && remainingDaysAfterToday > 0) {
    dailyRecoveryRequiredCents = Math.round(
      Math.abs(payCyclePositionCents) / remainingDaysAfterToday
    );
  }

  const recoveryMessage =
    payCyclePositionCents < 0
      ? "Beat tomorrow to pull it back."
      : "";

  const completionRaw = buildCycleCompletionState(
    settings,
    manualDailyTargetCents,
    manualSpends,
    trackingStartDate,
    ref,
    payCycle,
    (cents) =>
      formatMoney(toDisplayWholeDollarsCents(cents), currency, {
        wholeDollars: true,
      })
  );

  const cycleCompletion = completionRaw
    ? {
        pending: completionRaw.pending,
        title: completionRaw.title,
        headline: completionRaw.headline,
        subline: completionRaw.subline,
        isUnderLine: completionRaw.isUnderLine,
        positionCents: completionRaw.positionCents,
      }
    : null;

  return {
    payCycle,
    cycleIncomeCents,
    dailySavingsTargetCents,
    fixedDailyBurnCents,
    cycleSavingsTargetCents,
    cycleFixedBurnCents,
    manualDailyTargetCents,
    todayManualSpendCents,
    spentTodayCents,
    maxTodayCents,
    remainingTodayCents,
    spentTodayDisplayCents,
    maxTodayDisplayCents,
    remainingTodayDisplayCents,
    isTodayOver: todayOver,
    hasPayCyclePositionData,
    hasManualSpendHistoryBeforeToday,
    todayRemainingCents,
    todayRemainingDisplayCents,
    isTodayRed: isTodayRed(remainingTodayCents),
    elapsedCycleDaysIncludingToday,
    remainingDaysAfterToday,
    trackingStartDate,
    payCycleTrackedStart,
    payCycleTrackedDays,
    payCyclePositionCents,
    cyclePositionCents: payCyclePositionCents,
    manualAllowedToDateCents,
    manualSpendToDateCents,
    yearTrackedStart,
    yearTrackedDays,
    yearPositionCents,
    hasYearPositionData,
    dailyRecoveryRequiredCents,
    recoveryMessage,
    cycleCompletion,
    currency,
  };
}

/** Bill payments refine estimates; they do not add to manual spend. */
export function billPaymentAffectsManualSpend(): boolean {
  return false;
}
