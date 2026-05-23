import type { IncomeFrequency, PayCycle } from "./types";

/** Start of calendar day in local terms (UTC date parts from ISO date string). */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDateOnly(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  return Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return startOfDay(result);
}

function clampDayOfMonth(year: number, month: number, day: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.min(day, lastDay);
}

/** Most recent monthly payday on or before `reference`. */
function monthlyCycleStart(reference: Date, paydayDay: number): Date {
  const ref = startOfDay(reference);
  let year = ref.getFullYear();
  let month = ref.getMonth();
  let day = clampDayOfMonth(year, month, paydayDay);

  let candidate = new Date(year, month, day);
  if (candidate > ref) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    day = clampDayOfMonth(year, month, paydayDay);
    candidate = new Date(year, month, day);
  }
  return startOfDay(candidate);
}

/** Day before the next monthly payday after cycle start. */
function monthlyCycleEnd(cycleStart: Date, paydayDay: number): Date {
  let year = cycleStart.getFullYear();
  let month = cycleStart.getMonth() + 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }
  const nextPaydayDay = clampDayOfMonth(year, month, paydayDay);
  const nextPayday = new Date(year, month, nextPaydayDay);
  return addDays(nextPayday, -1);
}

function anchorCycleStart(
  reference: Date,
  nextPayday: Date,
  cycleLengthDays: number
): Date {
  const ref = startOfDay(reference);
  let start = startOfDay(nextPayday);

  while (start > ref) {
    start = addDays(start, -cycleLengthDays);
  }

  while (addDays(start, cycleLengthDays - 1) < ref) {
    start = addDays(start, cycleLengthDays);
  }

  return start;
}

export function getPayCycle(
  frequency: IncomeFrequency,
  nextPayday: Date,
  referenceDate: Date
): PayCycle {
  const ref = startOfDay(referenceDate);
  const anchor = startOfDay(nextPayday);

  if (frequency === "monthly") {
    const paydayDay = anchor.getDate();
    const start = monthlyCycleStart(ref, paydayDay);
    const end = monthlyCycleEnd(start, paydayDay);
    return {
      start,
      end,
      days: daysBetweenInclusive(start, end),
    };
  }

  const cycleLengthDays = frequency === "weekly" ? 7 : 14;
  const start = anchorCycleStart(ref, anchor, cycleLengthDays);
  const end = addDays(start, cycleLengthDays - 1);

  return {
    start,
    end,
    days: cycleLengthDays,
  };
}

export function getCycleIncomeCents(incomeAmountCents: number): number {
  return incomeAmountCents;
}

export function getElapsedDaysIncludingToday(
  cycleStart: Date,
  referenceDate: Date
): number {
  return daysBetweenInclusive(cycleStart, referenceDate);
}

export function getRemainingDaysAfterToday(
  cycleEnd: Date,
  referenceDate: Date
): number {
  const tomorrow = addDays(referenceDate, 1);
  if (tomorrow > cycleEnd) {
    return 0;
  }
  return daysBetweenInclusive(tomorrow, cycleEnd);
}
