import { describe, expect, it } from "vitest";
import {
  isOnboardingComplete,
  onboardingPath,
  resolveOnboardingStep,
  shouldRedirectCompletedUserAwayFromStep,
} from "./status";

describe("onboarding status", () => {
  it("is incomplete without budget settings", () => {
    expect(
      isOnboardingComplete({
        hasBudgetSettings: false,
        hasSavingsTarget: false,
      })
    ).toBe(false);
  });

  it("is incomplete with income only", () => {
    expect(
      isOnboardingComplete({
        hasBudgetSettings: true,
        hasSavingsTarget: false,
      })
    ).toBe(false);
  });

  it("is complete with income and savings", () => {
    expect(
      isOnboardingComplete({
        hasBudgetSettings: true,
        hasSavingsTarget: true,
      })
    ).toBe(true);
  });

  it("resolves to step 1 when income missing", () => {
    expect(
      resolveOnboardingStep({
        hasBudgetSettings: false,
        hasSavingsTarget: false,
      })
    ).toBe(1);
  });

  it("resolves to step 2 when savings missing", () => {
    expect(
      resolveOnboardingStep({
        hasBudgetSettings: true,
        hasSavingsTarget: false,
      })
    ).toBe(2);
  });

  it("does not jump to step 4 before savings exists", () => {
    expect(
      resolveOnboardingStep(
        { hasBudgetSettings: true, hasSavingsTarget: false },
        4
      )
    ).toBe(2);
  });

  it("allows step 3 or 4 when complete", () => {
    expect(
      resolveOnboardingStep(
        { hasBudgetSettings: true, hasSavingsTarget: true },
        4
      )
    ).toBe(4);
  });

  it("bumps sub-3 requests to step 3 when complete", () => {
    expect(
      resolveOnboardingStep(
        { hasBudgetSettings: true, hasSavingsTarget: true },
        1
      )
    ).toBe(3);
  });

  it("onboarding path points at first missing step", () => {
    expect(
      onboardingPath({ hasBudgetSettings: false, hasSavingsTarget: false })
    ).toBe("/onboarding?step=1");
    expect(
      onboardingPath({ hasBudgetSettings: true, hasSavingsTarget: false })
    ).toBe("/onboarding?step=2");
  });

  it("redirects completed users away from steps 1–2 only", () => {
    const complete = {
      hasBudgetSettings: true,
      hasSavingsTarget: true,
    };
    expect(shouldRedirectCompletedUserAwayFromStep(complete, 1)).toBe(true);
    expect(shouldRedirectCompletedUserAwayFromStep(complete, 2)).toBe(true);
    expect(shouldRedirectCompletedUserAwayFromStep(complete, 3)).toBe(false);
    expect(shouldRedirectCompletedUserAwayFromStep(complete, 4)).toBe(false);
  });
});
