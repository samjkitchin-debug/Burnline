import { describe, expect, it } from "vitest";
import {
  MoneyParseError,
  parseDollarsToCents,
  parseDollarsToCentsSafe,
} from "./parseDollarsToCents";

describe("parseDollarsToCents", () => {
  it("accepts whole dollars", () => {
    expect(parseDollarsToCents("12")).toBe(1200);
  });

  it("accepts one decimal place", () => {
    expect(parseDollarsToCents("12.3")).toBe(1230);
  });

  it("accepts two decimal places", () => {
    expect(parseDollarsToCents("12.34")).toBe(1234);
  });

  it("rejects empty", () => {
    expect(() => parseDollarsToCents("")).toThrow(MoneyParseError);
    expect(() => parseDollarsToCents("   ")).toThrow(MoneyParseError);
  });

  it("rejects negative values", () => {
    expect(() => parseDollarsToCents("-12")).toThrow(MoneyParseError);
    expect(() => parseDollarsToCents("-12.34")).toThrow(MoneyParseError);
  });

  it("rejects junk suffix", () => {
    expect(() => parseDollarsToCents("12abc")).toThrow(MoneyParseError);
  });

  it("rejects more than two decimals", () => {
    expect(() => parseDollarsToCents("12.345")).toThrow(MoneyParseError);
  });

  it("returns safe errors without throwing", () => {
    expect(parseDollarsToCentsSafe("12abc")).toEqual({
      error: "Enter a valid amount (up to two decimal places)",
    });
    expect(parseDollarsToCentsSafe("9.99")).toEqual({ cents: 999 });
  });
});
