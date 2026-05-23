import { formatMoney, toDisplayWholeDollarsCents } from "@/lib/budget/formatMoney";
import type { BudgetSnapshot } from "@/lib/budget/types";

export function todayHeroCopy(snapshot: BudgetSnapshot): {
  spentLabel: string;
  lineLabel: string;
  subline: string;
  isOver: boolean;
} {
  const { currency, isTodayOver: isOver } = snapshot;

  const spentLabel = formatMoney(
    snapshot.spentTodayDisplayCents,
    currency,
    { wholeDollars: true }
  );
  const lineLabel = formatMoney(
    snapshot.maxTodayDisplayCents,
    currency,
    { wholeDollars: true }
  );

  const bufferFormatted = formatMoney(
    Math.abs(snapshot.remainingTodayDisplayCents),
    currency,
    { wholeDollars: true }
  );

  if (isOver) {
    return {
      spentLabel,
      lineLabel,
      subline: `${bufferFormatted} over today\u2019s line. Beat tomorrow to pull it back.`,
      isOver: true,
    };
  }

  return {
    spentLabel,
    lineLabel,
    subline: `${bufferFormatted} under the line.`,
    isOver: false,
  };
}

export function payCyclePositionCopy(snapshot: BudgetSnapshot): {
  title: string;
  headline: string;
  subline: string;
  daysLeftLabel: string | null;
  yearLine: string | null;
  showTrackingPlaceholder: boolean;
  isOver: boolean;
} {
  const title = "Pay cycle position";

  if (!snapshot.hasPayCyclePositionData) {
    return {
      title,
      headline: "Tracking starts today",
      subline:
        "Your first pay-cycle position will build as you enter spends.",
      daysLeftLabel: null,
      yearLine: null,
      showTrackingPlaceholder: true,
      isOver: false,
    };
  }

  const amount = formatMoney(
    Math.abs(toDisplayWholeDollarsCents(snapshot.payCyclePositionCents)),
    snapshot.currency,
    { wholeDollars: true }
  );
  const isOver = snapshot.payCyclePositionCents < 0;
  const daysLeft = snapshot.remainingDaysAfterToday;

  const headline = isOver
    ? `${amount} over the line`
    : `${amount} under the line`;

  const subline = isOver
    ? "Beat tomorrow to pull it back."
    : "Keep beating the day.";

  const daysLeftLabel =
    daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : null;

  let yearLine: string | null = null;
  if (snapshot.hasYearPositionData) {
    const yearAmount = formatMoney(
      Math.abs(toDisplayWholeDollarsCents(snapshot.yearPositionCents)),
      snapshot.currency,
      { wholeDollars: true }
    );
    const yearDir =
      snapshot.yearPositionCents < 0 ? "over the line" : "under the line";
    yearLine = `This year: ${yearAmount} ${yearDir}`;
  }

  return {
    title,
    headline,
    subline,
    daysLeftLabel,
    yearLine,
    showTrackingPlaceholder: false,
    isOver,
  };
}

/** @deprecated Use payCyclePositionCopy */
export const cyclePositionCopy = payCyclePositionCopy;
