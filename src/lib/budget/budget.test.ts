import { describe, expect, it } from "vitest";
import {
  billPaymentAffectsManualSpend,
  calculateBudget,
} from "./calculateBudget";
import {
  isPendingPayCycleCompletion,
  buildCycleCompletionState,
} from "./cycleCompletion";
import {
  deriveTrackingStartDate,
  inclusiveLocalDayCount,
  computeManualPositionCents,
} from "./positions";
import { estimateBillStreamAmountCents } from "./billEstimates";
import { annualiseToDailyCents } from "./frequencies";
import {
  formatMoney,
  isTodayOver,
  isTodayRed,
  toDisplayWholeDollarsCents,
} from "./formatMoney";
import {
  daysBetweenInclusive,
  getPayCycle,
  parseDateOnly,
} from "./payCycles";
import type { BudgetCalculationInput } from "./types";

function d(iso: string): Date {
  return parseDateOnly(iso);
}

function baseInput(
  overrides: Partial<BudgetCalculationInput> & {
    trackingStartFromProfile?: Date | null;
  } = {}
): BudgetCalculationInput {
  const manualSpends = overrides.manualSpends ?? [];
  const referenceDate = overrides.referenceDate ?? d("2026-05-20");
  const { trackingStartFromProfile = null, ...inputOverrides } = overrides;

  return {
    settings: {
      incomeAmountCents: 10_000_00,
      incomeFrequency: "monthly",
      nextPayday: d("2026-06-15"),
    },
    savings: {
      amountCents: 3_000_00,
      frequency: "monthly",
    },
    billStreams: [
      {
        id: "rent",
        name: "Rent",
        frequency: "monthly",
        estimatedAmountCents: 3_000_00,
        isActive: true,
      },
    ],
    manualSpends,
    trackingStartDate:
      overrides.trackingStartDate ??
      deriveTrackingStartDate(
        manualSpends,
        trackingStartFromProfile,
        referenceDate
      ),
    referenceDate,
    currency: "SGD",
    ...inputOverrides,
  };
}

describe("pay cycles", () => {
  it("monthly pay on 15th runs 15th to 14th", () => {
    const cycle = getPayCycle("monthly", d("2026-06-15"), d("2026-05-20"));
    expect(cycle.start).toEqual(d("2026-05-15"));
    expect(cycle.end).toEqual(d("2026-06-14"));
    expect(cycle.days).toBe(31);
  });

  it("weekly pay cycle from anchor", () => {
    const cycle = getPayCycle("weekly", d("2026-05-28"), d("2026-05-23"));
    expect(cycle.start).toEqual(d("2026-05-21"));
    expect(cycle.end).toEqual(d("2026-05-27"));
    expect(cycle.days).toBe(7);
  });

  it("fortnightly pay cycle from anchor", () => {
    const cycle = getPayCycle(
      "fortnightly",
      d("2026-06-01"),
      d("2026-05-20")
    );
    expect(cycle.start).toEqual(d("2026-05-18"));
    expect(cycle.end).toEqual(d("2026-05-31"));
    expect(cycle.days).toBe(14);
  });

  it("month length variation changes cycle days", () => {
    const feb = getPayCycle("monthly", d("2026-03-15"), d("2026-02-20"));
    expect(feb.days).toBe(28);
    const jan = getPayCycle("monthly", d("2026-02-15"), d("2026-01-20"));
    expect(jan.days).toBe(31);
  });
});

describe("annualisation", () => {
  it("savings target annualises to daily", () => {
    const daily = annualiseToDailyCents(52_000_00, "annually");
    expect(daily).toBe(Math.round((52_000_00 * 1) / 365));
  });

  it("fixed bill stream daily burn", () => {
    const daily = annualiseToDailyCents(3_000_00, "monthly");
    expect(daily).toBe(Math.round((3_000_00 * 12) / 365));
  });

  it("annual bill daily burn", () => {
    const daily = annualiseToDailyCents(365_00, "annually");
    expect(daily).toBe(100);
  });

  it("monthly rent $4,900 produces about $161.10/day", () => {
    const daily = annualiseToDailyCents(4_900_00, "monthly");
    expect(daily).toBe(16_110);
    expect(daily).toBe(Math.round((4_900_00 * 12) / 365));
  });

  it("annual bill $1,095 produces $3/day", () => {
    const daily = annualiseToDailyCents(109_500, "annually");
    expect(daily).toBe(300);
    expect(daily).toBe(Math.round(109_500 / 365));
  });

  it("monthly savings target uses amount * 12 / 365", () => {
    const daily = annualiseToDailyCents(2_500_00, "monthly");
    expect(daily).toBe(Math.round((2_500_00 * 12) / 365));
  });

  it("weekly recurring uses 52 calendar periods per year", () => {
    const daily = annualiseToDailyCents(100_00, "weekly");
    expect(daily).toBe(Math.round((100_00 * 52) / 365));
  });

  it("fortnightly recurring uses 26 calendar periods per year", () => {
    const daily = annualiseToDailyCents(200_00, "fortnightly");
    expect(daily).toBe(Math.round((200_00 * 26) / 365));
  });

  it("quarterly recurring uses 4 periods per year", () => {
    const daily = annualiseToDailyCents(900_00, "quarterly");
    expect(daily).toBe(Math.round((900_00 * 4) / 365));
  });
});

describe("budget calculations", () => {
  it("manual daily target from cycle income minus savings and fixed burn", () => {
    const input = baseInput({
      billStreams: [
        {
          id: "rent",
          name: "Rent",
          frequency: "monthly",
          estimatedAmountCents: 3_000_00,
          isActive: true,
        },
      ],
    });
    const snap = calculateBudget(input);
    const expectedFixedDaily = annualiseToDailyCents(3_000_00, "monthly");
    const expectedSavingsDaily = annualiseToDailyCents(3_000_00, "monthly");
    const expectedManual =
      (10_000_00 -
        Math.round(expectedSavingsDaily * snap.payCycle.days) -
        Math.round(expectedFixedDaily * snap.payCycle.days)) /
      snap.payCycle.days;
    expect(snap.manualDailyTargetCents).toBe(Math.round(expectedManual));
  });

  it("today remaining subtracts manual spend today", () => {
    const snap = calculateBudget(
      baseInput({
        manualSpends: [
          { amountCents: 50_00, spentOn: d("2026-05-20") },
        ],
      })
    );
    expect(snap.todayRemainingCents).toBe(
      snap.manualDailyTargetCents - 50_00
    );
  });

  it("pay cycle position is primary and mirrors cyclePositionCents", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-17"),
        manualSpends: [
          { amountCents: 20_00, spentOn: d("2026-05-15") },
          { amountCents: 10_00, spentOn: d("2026-05-16") },
        ],
      })
    );
    expect(snap.payCyclePositionCents).toBe(snap.cyclePositionCents);
    expect(snap.payCyclePositionCents).toBeGreaterThan(0);
    expect(snap.hasPayCyclePositionData).toBe(true);
  });

  it("pay cycle position under the line when manual spend is low", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-17"),
        manualSpends: [
          { amountCents: 20_00, spentOn: d("2026-05-15") },
          { amountCents: 10_00, spentOn: d("2026-05-16") },
        ],
      })
    );
    expect(snap.payCyclePositionCents).toBeGreaterThan(0);
  });

  it("pay cycle position over the line when manual spend is high", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-20"),
        manualSpends: Array.from({ length: 6 }, (_, i) => ({
          amountCents: 500_00,
          spentOn: d(`2026-05-${15 + i}`),
        })),
      })
    );
    expect(snap.payCyclePositionCents).toBeLessThan(0);
    expect(snap.recoveryMessage).toContain("Beat tomorrow");
  });

  it("recovery uses pay cycle position when over the line", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-20"),
        manualSpends: Array.from({ length: 6 }, (_, i) => ({
          amountCents: 800_00,
          spentOn: d(`2026-05-${15 + i}`),
        })),
      })
    );
    expect(snap.dailyRecoveryRequiredCents).not.toBeNull();
    if (snap.payCyclePositionCents < 0 && snap.remainingDaysAfterToday > 0) {
      expect(snap.dailyRecoveryRequiredCents).toBe(
        Math.round(
          Math.abs(snap.payCyclePositionCents) / snap.remainingDaysAfterToday
        )
      );
    }
  });

  it("first tracked day position equals manual daily target with no spend", () => {
    const today = d("2026-05-23");
    const snap = calculateBudget(
      baseInput({
        referenceDate: today,
        trackingStartDate: today,
        manualSpends: [],
        billStreams: [],
      })
    );
    expect(snap.payCycleTrackedDays).toBe(1);
    expect(snap.hasPayCyclePositionData).toBe(true);
    expect(snap.payCyclePositionCents).toBe(snap.manualDailyTargetCents);
  });

  it("first tracked day with spend reduces pay-cycle position", () => {
    const today = d("2026-05-23");
    const snap = calculateBudget(
      baseInput({
        referenceDate: today,
        trackingStartDate: today,
        manualSpends: [{ amountCents: 50_00, spentOn: today }],
        billStreams: [],
      })
    );
    expect(snap.payCycleTrackedDays).toBe(1);
    expect(snap.payCyclePositionCents).toBe(
      snap.manualDailyTargetCents - 50_00
    );
  });

  it("pay cycle position uses tracked days only after tracking start", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-20"),
        trackingStartDate: d("2026-05-18"),
        manualSpends: [{ amountCents: 50_00, spentOn: d("2026-05-20") }],
      })
    );
    expect(snap.payCycleTrackedStart).toEqual(d("2026-05-18"));
    expect(snap.payCycleTrackedDays).toBe(3);
    expect(snap.manualAllowedToDateCents).toBe(
      Math.round(snap.manualDailyTargetCents * 3)
    );
    expect(snap.manualSpendToDateCents).toBe(50_00);
  });

  it("ignores manual spend before tracking began", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-22"),
        trackingStartDate: d("2026-05-20"),
        manualSpends: [
          { amountCents: 9_000_00, spentOn: d("2026-05-16") },
          { amountCents: 40_00, spentOn: d("2026-05-21") },
        ],
      })
    );
    expect(snap.manualSpendToDateCents).toBe(40_00);
  });

  it("year position is secondary and uses tracked year period", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-20"),
        trackingStartDate: d("2026-05-18"),
        manualSpends: [
          { amountCents: 30_00, spentOn: d("2026-05-19") },
          { amountCents: 50_00, spentOn: d("2026-05-20") },
        ],
      })
    );
    expect(snap.yearTrackedStart).toEqual(d("2026-05-18"));
    expect(snap.yearPositionCents).toBe(
      Math.round(snap.manualDailyTargetCents * snap.yearTrackedDays) -
        80_00
    );
    expect(snap.hasYearPositionData).toBe(true);
  });

  it("year position starts from Jan 1 when tracking began earlier", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-20"),
        trackingStartDate: d("2025-11-01"),
        manualSpends: [{ amountCents: 10_00, spentOn: d("2026-05-19") }],
      })
    );
    expect(snap.yearTrackedStart).toEqual(d("2026-01-01"));
  });
});

describe("pay cycle completion", () => {
  const completionSettings = {
    incomeAmountCents: 10_000_00,
    incomeFrequency: "monthly" as const,
    nextPayday: d("2026-06-15"),
  };

  it("pending when reference is in a new pay cycle", () => {
    expect(
      isPendingPayCycleCompletion(d("2026-06-15"), completionSettings)
    ).toBe(true);
  });

  it("not pending on last day of pay cycle", () => {
    expect(
      isPendingPayCycleCompletion(d("2026-06-14"), completionSettings)
    ).toBe(false);
  });

  it("documents under-line completion copy", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-06-15"),
        manualSpends: [{ amountCents: 10_00, spentOn: d("2026-05-20") }],
      })
    );
    expect(snap.cycleCompletion?.title).toBe("Pay cycle complete");
    expect(snap.cycleCompletion?.headline).toContain("under the line");
    expect(snap.cycleCompletion?.subline).toContain("savings");
  });

  it("documents over-line completion copy", () => {
    const completion = buildCycleCompletionState(
      completionSettings,
      200_00,
      Array.from({ length: 10 }, (_, i) => ({
        amountCents: 2_000_00,
        spentOn: d(`2026-05-${15 + i}`),
      })),
      d("2026-05-15"),
      d("2026-06-15"),
      getPayCycle("monthly", d("2026-06-15"), d("2026-06-15")),
      (c) => `$${Math.round(c / 100)}`
    );
    expect(completion?.headline).toContain("over the line");
    expect(completion?.subline).toContain("Reset today");
  });
});

describe("spent today and max today", () => {
  it("spentTodayCents equals fixed daily burn plus manual spend today", () => {
    const snap = calculateBudget(
      baseInput({
        manualSpends: [{ amountCents: 50_00, spentOn: d("2026-05-20") }],
      })
    );
    expect(snap.spentTodayCents).toBe(
      snap.fixedDailyBurnCents + snap.todayManualSpendCents
    );
    expect(snap.todayManualSpendCents).toBe(50_00);
  });

  it("maxTodayCents equals fixed daily burn plus manual daily target", () => {
    const snap = calculateBudget(baseInput());
    expect(snap.maxTodayCents).toBe(
      snap.fixedDailyBurnCents + snap.manualDailyTargetCents
    );
  });

  it("remainingTodayCents equals maxToday minus spentToday", () => {
    const snap = calculateBudget(
      baseInput({
        manualSpends: [{ amountCents: 30_00, spentOn: d("2026-05-20") }],
      })
    );
    expect(snap.remainingTodayCents).toBe(
      snap.maxTodayCents - snap.spentTodayCents
    );
    expect(snap.remainingTodayCents).toBe(
      snap.manualDailyTargetCents - snap.todayManualSpendCents
    );
  });

  it("savings target is not counted in spent today", () => {
    const snap = calculateBudget(baseInput());
    expect(snap.spentTodayCents).toBe(
      snap.fixedDailyBurnCents + snap.todayManualSpendCents
    );
    expect(snap.spentTodayCents).toBeLessThan(
      snap.fixedDailyBurnCents + snap.dailySavingsTargetCents
    );
  });

  it("shows pay cycle position on first tracking day with no spend", () => {
    const today = d("2026-05-20");
    const snap = calculateBudget(
      baseInput({
        manualSpends: [],
        trackingStartDate: today,
        referenceDate: today,
        billStreams: [],
      })
    );
    expect(snap.hasPayCyclePositionData).toBe(true);
    expect(snap.payCycleTrackedDays).toBe(1);
    expect(snap.payCyclePositionCents).toBe(snap.manualDailyTargetCents);
    expect(snap.hasManualSpendHistoryBeforeToday).toBe(false);
  });

  it("null tracking_start_date falls back to today not an earlier UTC day", () => {
    const today = d("2026-05-23");
    const tracking = deriveTrackingStartDate([], null, today);
    expect(inclusiveLocalDayCount(tracking, today)).toBe(1);
    const pos = computeManualPositionCents(
      169_00,
      [],
      d("2026-04-26"),
      today,
      tracking
    );
    expect(pos.trackedDays).toBe(1);
    expect(pos.positionCents).toBe(169_00);
  });

  it("tracking_start_date same as today gives one tracked pay-cycle day", () => {
    const today = d("2026-05-23");
    const snap = calculateBudget(
      baseInput({
        referenceDate: today,
        trackingStartFromProfile: today,
        manualSpends: [],
        billStreams: [],
      })
    );
    expect(snap.payCycleTrackedDays).toBe(1);
    expect(snap.payCyclePositionCents).toBe(snap.manualDailyTargetCents);
  });

  it("has pay cycle position data when prior tracked entries exist", () => {
    const snap = calculateBudget(
      baseInput({
        referenceDate: d("2026-05-20"),
        manualSpends: [{ amountCents: 10_00, spentOn: d("2026-05-19") }],
      })
    );
    expect(snap.hasPayCyclePositionData).toBe(true);
    expect(snap.hasManualSpendHistoryBeforeToday).toBe(true);
  });
});

describe("red state and display", () => {
  it("internal -38 cents displays $0 not red", () => {
    expect(toDisplayWholeDollarsCents(-38)).toBe(0);
    expect(isTodayRed(-38)).toBe(false);
  });

  it("internal -120 cents displays -$1 and red", () => {
    expect(toDisplayWholeDollarsCents(-120)).toBe(-100);
    expect(isTodayRed(-120)).toBe(true);
  });

  it("isTodayOver when displayed spent exceeds displayed max", () => {
    const fixed = 200_00;
    const manualTarget = 100_00;
    const maxToday = fixed + manualTarget;
    const spentToday = fixed + 150_00;
    const remaining = maxToday - spentToday;
    expect(isTodayOver(spentToday, maxToday, remaining)).toBe(true);
  });

  it("isTodayOver follows remaining whole-dollar display when negative", () => {
    const snap = calculateBudget(
      baseInput({
        manualSpends: [{ amountCents: 9_999_00, spentOn: d("2026-05-20") }],
      })
    );
    expect(snap.remainingTodayCents).toBeLessThan(0);
    expect(snap.isTodayOver).toBe(true);
  });
});

describe("bill streams", () => {
  it("bill payment does not count as manual spend", () => {
    expect(billPaymentAffectsManualSpend()).toBe(false);
  });

  it("monthly bill rolling average of last 3 payments", () => {
    const estimate = estimateBillStreamAmountCents(
      "monthly",
      200_00,
      [
        { billStreamId: "e", amountCents: 210_00, paidOn: d("2026-03-01") },
        { billStreamId: "e", amountCents: 220_00, paidOn: d("2026-04-01") },
        { billStreamId: "e", amountCents: 230_00, paidOn: d("2026-05-01") },
        { billStreamId: "e", amountCents: 999_00, paidOn: d("2026-02-01") },
      ]
    );
    expect(estimate).toBe(Math.round((230_00 + 220_00 + 210_00) / 3));
  });

  it("annual bill uses latest payment only", () => {
    const estimate = estimateBillStreamAmountCents(
      "annually",
      500_00,
      [
        { billStreamId: "c", amountCents: 400_00, paidOn: d("2025-01-01") },
        { billStreamId: "c", amountCents: 450_00, paidOn: d("2026-01-01") },
      ]
    );
    expect(estimate).toBe(450_00);
  });
});

describe("currency", () => {
  it("one currency per calculation snapshot", () => {
    const snap = calculateBudget(baseInput({ currency: "SGD" }));
    expect(snap.currency).toBe("SGD");
    expect(formatMoney(100_00, snap.currency)).toMatch(/\$|S\$|SGD/);
  });
});

describe("daysBetweenInclusive", () => {
  it("counts inclusive calendar days", () => {
    expect(daysBetweenInclusive(d("2026-05-15"), d("2026-05-20"))).toBe(6);
  });
});
