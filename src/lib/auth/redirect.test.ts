import { describe, expect, it } from "vitest";
import { loginPath, sanitizeNext } from "./redirect";

describe("sanitizeNext", () => {
  it("defaults empty to /today", () => {
    expect(sanitizeNext(undefined)).toBe("/today");
    expect(sanitizeNext("")).toBe("/today");
  });

  it("allows internal paths", () => {
    expect(sanitizeNext("/today/add")).toBe("/today/add");
    expect(sanitizeNext("/fixed-costs")).toBe("/fixed-costs");
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(sanitizeNext("https://evil.com")).toBe("/today");
    expect(sanitizeNext("//evil.com")).toBe("/today");
  });
});

describe("loginPath", () => {
  it("includes next query param", () => {
    expect(loginPath("/today")).toBe("/login?next=%2Ftoday");
  });
});
