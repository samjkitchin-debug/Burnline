import { describe, expect, it } from "vitest";
import {
  buildProfileTimezoneOptions,
  getReferenceDateInTimezone,
  getTodayDateOnlyInTimezone,
  getTodayDateStringInTimezone,
  normalizeTimezone,
  resolveDeviceTimezone,
} from "./timezone";
import { deriveTrackingStartDate } from "@/lib/budget/positions";
import { parseDateOnly } from "@/lib/budget/payCycles";

describe("timezone dates", () => {
  it("uses Asia/Singapore calendar day for a known instant", () => {
    const instant = new Date("2026-05-22T20:00:00.000Z");
    expect(getTodayDateStringInTimezone("Asia/Singapore", instant)).toBe(
      "2026-05-23"
    );
    expect(getTodayDateOnlyInTimezone("Asia/Singapore", instant)).toBe(
      "2026-05-23"
    );
  });

  it("reference date matches timezone calendar string", () => {
    const ref = getReferenceDateInTimezone(
      "Asia/Singapore",
      new Date("2026-05-22T20:00:00.000Z")
    );
    expect(ref.getFullYear()).toBe(2026);
    expect(ref.getMonth()).toBe(4);
    expect(ref.getDate()).toBe(23);
  });

  it("falls back for invalid timezone", () => {
    expect(normalizeTimezone("Not/A_Zone")).toBe("Asia/Singapore");
  });

  it("manual spend near UTC midnight uses profile timezone today", () => {
    const instant = new Date("2026-05-22T20:00:00.000Z");
    const spentOn = getTodayDateStringInTimezone("Asia/Singapore", instant);
    expect(spentOn).toBe("2026-05-23");
    expect(spentOn).not.toBe("2026-05-22");
  });

  it("null tracking_start_date falls back to profile today not UTC yesterday", () => {
    const instant = new Date("2026-05-22T20:00:00.000Z");
    const today = parseDateOnly(
      getTodayDateStringInTimezone("Asia/Singapore", instant)
    );
    const tracking = deriveTrackingStartDate([], null, today);
    expect(tracking).toEqual(today);
  });

  it("changing timezone reference does not invent earlier tracked days without spends", () => {
    const ref = parseDateOnly("2026-05-23");
    const tracking = deriveTrackingStartDate([], parseDateOnly("2026-05-23"), ref);
    expect(tracking).toEqual(ref);
  });
});

describe("profile timezone options", () => {
  it("includes stored and device timezones in the list", () => {
    const options = buildProfileTimezoneOptions(
      "Pacific/Auckland",
      "Pacific/Auckland"
    );
    expect(options).toContain("Asia/Singapore");
    expect(options).toContain("Pacific/Auckland");
  });

  it("resolveDeviceTimezone returns a valid IANA zone or default", () => {
    const tz = resolveDeviceTimezone();
    expect(tz.length).toBeGreaterThan(0);
    expect(normalizeTimezone(tz)).toBe(tz);
  });
});
