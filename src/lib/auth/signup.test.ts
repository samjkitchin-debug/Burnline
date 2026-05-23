import { describe, expect, it } from "vitest";
import { loginPath, onboardingPathWithNext, sanitizeNext } from "./redirect";
import { signupRequiresConfirmation } from "./signup";

describe("signupRequiresConfirmation", () => {
  it("is true when session is null", () => {
    expect(signupRequiresConfirmation(null)).toBe(true);
  });

  it("is false when session exists", () => {
    expect(signupRequiresConfirmation({ access_token: "x" })).toBe(false);
  });
});

describe("auth redirect helpers with next", () => {
  it("preserves deep link in login path", () => {
    expect(loginPath("/today/add")).toBe("/login?next=%2Ftoday%2Fadd");
  });

  it("onboarding path keeps next for incomplete setup", () => {
    expect(
      onboardingPathWithNext(
        { hasBudgetSettings: true, hasSavingsTarget: false },
        "/today/add"
      )
    ).toBe("/onboarding?step=2&next=%2Ftoday%2Fadd");
  });

  it("sanitise keeps internal deep paths", () => {
    expect(sanitizeNext("/today/add")).toBe("/today/add");
  });
});
