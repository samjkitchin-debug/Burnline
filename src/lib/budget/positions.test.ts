import { describe, expect, it } from "vitest";
import {
  computeManualPositionCents,
  deriveTrackingStartDate,
  inclusiveLocalDayCount,
} from "./positions";
import { getPayCycle, getRemainingDaysAfterToday, parseDateOnly } from "./payCycles";

function d(iso: string): Date {
  return parseDateOnly(iso);
}

describe("inclusiveLocalDayCount", () => {
  it("returns 1 when start and end are the same local day", () => {
    expect(inclusiveLocalDayCount(d("2026-05-23"), d("2026-05-23"))).toBe(1);
  });

  it("returns 2 when start is yesterday and end is today", () => {
    expect(inclusiveLocalDayCount(d("2026-05-22"), d("2026-05-23"))).toBe(2);
  });
});

describe("deriveTrackingStartDate", () => {
  it("uses reference day when profile tracking start is unset", () => {
    const today = d("2026-05-23");
    expect(deriveTrackingStartDate([], null, today)).toEqual(today);
  });

  it("uses profiles.tracking_start_date when set and no spends", () => {
    const today = d("2026-05-23");
    const started = d("2026-05-20");
    expect(deriveTrackingStartDate([], started, today)).toEqual(started);
  });

  it("uses earliest manual spend when spends exist", () => {
    const today = d("2026-05-23");
    expect(
      deriveTrackingStartDate(
        [{ amountCents: 10_00, spentOn: d("2026-05-20") }],
        d("2026-05-15"),
        today
      )
    ).toEqual(d("2026-05-20"));
  });

  it("does not use a future tracking_start_date beyond reference", () => {
    const today = d("2026-05-23");
    expect(deriveTrackingStartDate([], d("2026-05-25"), today)).toEqual(today);
  });
});

describe("pay cycle spend position", () => {
  const manualTarget = 169_00;
  const cycleStart = d("2026-04-26");
  const today = d("2026-05-23");

  it("first tracked day: position equals manual daily target", () => {
    const result = computeManualPositionCents(
      manualTarget,
      [],
      cycleStart,
      today,
      today
    );
    expect(result.trackedDays).toBe(1);
    expect(result.positionCents).toBe(manualTarget);
  });

  it("first tracked day with spend: position is target minus spend", () => {
    const result = computeManualPositionCents(
      manualTarget,
      [{ amountCents: 50_00, spentOn: today }],
      cycleStart,
      today,
      today
    );
    expect(result.trackedDays).toBe(1);
    expect(result.positionCents).toBe(manualTarget - 50_00);
  });

  it("second tracked day: two days of allowance minus spend", () => {
    const yesterday = d("2026-05-22");
    const result = computeManualPositionCents(
      manualTarget,
      [{ amountCents: 100_00, spentOn: yesterday }],
      cycleStart,
      today,
      yesterday
    );
    expect(result.trackedDays).toBe(2);
    expect(result.positionCents).toBe(manualTarget * 2 - 100_00);
  });

  it("mid-cycle tracking start does not count earlier cycle days", () => {
    const result = computeManualPositionCents(
      manualTarget,
      [],
      cycleStart,
      today,
      today
    );
    expect(result.trackedStart).toEqual(today);
    expect(result.trackedDays).toBe(1);
    expect(result.positionCents).toBe(manualTarget);
  });
});

describe("days left in pay cycle", () => {
  it("counts remaining local days after today until cycle end (payday 26th)", () => {
    const cycle = getPayCycle("monthly", d("2026-06-26"), d("2026-05-23"));
    expect(cycle.end).toEqual(d("2026-05-25"));
    expect(getRemainingDaysAfterToday(cycle.end, d("2026-05-23"))).toBe(2);
    expect(getRemainingDaysAfterToday(cycle.end, d("2026-05-24"))).toBe(1);
    expect(getRemainingDaysAfterToday(cycle.end, d("2026-05-25"))).toBe(0);
  });
});
