import { daysBetweenInclusive, startOfDay } from "./payCycles";
import type { ManualSpendInput } from "./types";

/** Inclusive local calendar day count; 1 when start and end are the same day. */
export function inclusiveLocalDayCount(start: Date, end: Date): number {
  const s = startOfDay(start);
  const e = startOfDay(end);
  if (e.getTime() < s.getTime()) {
    return 0;
  }
  return daysBetweenInclusive(s, e);
}

/**
 * When the user began tracking (local calendar dates).
 * v1: earliest manual spend; else profiles.tracking_start_date; else reference day.
 * Do not infer from UTC created_at.
 */
export function deriveTrackingStartDate(
  manualSpends: ManualSpendInput[],
  trackingStartFromProfile: Date | null | undefined,
  referenceLocal: Date
): Date {
  const ref = startOfDay(referenceLocal);

  if (manualSpends.length > 0) {
    return manualSpends.reduce((earliest, spend) => {
      const spent = startOfDay(spend.spentOn);
      return spent < earliest ? spent : earliest;
    }, startOfDay(manualSpends[0].spentOn));
  }

  if (trackingStartFromProfile) {
    const tracked = startOfDay(trackingStartFromProfile);
    return tracked.getTime() > ref.getTime() ? ref : tracked;
  }

  return ref;
}

/** Later of period start and when the user began tracking spends. */
export function getTrackedPeriodStart(
  periodStart: Date,
  trackingStartDate: Date
): Date {
  const period = startOfDay(periodStart).getTime();
  const tracking = startOfDay(trackingStartDate).getTime();
  return period >= tracking ? startOfDay(periodStart) : startOfDay(trackingStartDate);
}

export function getYearPeriodStart(
  referenceDate: Date,
  trackingStartDate: Date
): Date {
  const yearStart = new Date(referenceDate.getFullYear(), 0, 1);
  return getTrackedPeriodStart(yearStart, trackingStartDate);
}

export function manualSpendInPeriod(
  spends: ManualSpendInput[],
  periodStart: Date,
  periodEnd: Date
): number {
  const start = startOfDay(periodStart).getTime();
  const end = startOfDay(periodEnd).getTime();
  return spends
    .filter((s) => {
      const t = startOfDay(s.spentOn).getTime();
      return t >= start && t <= end;
    })
    .reduce((sum, s) => sum + s.amountCents, 0);
}

export function manualSpendBeforeDateInPeriod(
  spends: ManualSpendInput[],
  periodStart: Date,
  beforeDate: Date
): number {
  const start = startOfDay(periodStart).getTime();
  const before = startOfDay(beforeDate).getTime();
  return spends
    .filter((s) => {
      const t = startOfDay(s.spentOn).getTime();
      return t >= start && t < before;
    })
    .reduce((sum, s) => sum + s.amountCents, 0);
}

export function trackedElapsedDaysIncludingToday(
  periodStart: Date,
  trackingStartDate: Date,
  referenceDate: Date
): number {
  const trackedStart = getTrackedPeriodStart(periodStart, trackingStartDate);
  return inclusiveLocalDayCount(trackedStart, referenceDate);
}

/** Show pay-cycle position once there is at least one tracked day in the period. */
export function hasEnoughPayCyclePositionData(
  payCycleStart: Date,
  trackingStartDate: Date,
  referenceDate: Date
): boolean {
  const trackedStart = getTrackedPeriodStart(payCycleStart, trackingStartDate);
  return inclusiveLocalDayCount(trackedStart, referenceDate) >= 1;
}

export function computeManualPositionCents(
  manualDailyTargetCents: number,
  manualSpends: ManualSpendInput[],
  periodStart: Date,
  periodEnd: Date,
  trackingStartDate: Date
): {
  positionCents: number;
  allowedCents: number;
  spendCents: number;
  trackedStart: Date;
  trackedDays: number;
} {
  const trackedStart = getTrackedPeriodStart(periodStart, trackingStartDate);
  const trackedDays = inclusiveLocalDayCount(trackedStart, periodEnd);
  const allowedCents = Math.round(manualDailyTargetCents * trackedDays);
  const spendCents = manualSpendInPeriod(manualSpends, trackedStart, periodEnd);
  return {
    positionCents: allowedCents - spendCents,
    allowedCents,
    spendCents,
    trackedStart,
    trackedDays,
  };
}
