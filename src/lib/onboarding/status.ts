export interface OnboardingRequirements {
  hasBudgetSettings: boolean;
  hasSavingsTarget: boolean;
}

/** Income + savings required; bill streams optional. */
export function isOnboardingComplete(
  requirements: OnboardingRequirements
): boolean {
  return requirements.hasBudgetSettings && requirements.hasSavingsTarget;
}

/** Lowest incomplete step (1–4). Steps 3–4 are optional bill setup + summary. */
export function resolveOnboardingStep(
  requirements: OnboardingRequirements,
  requestedStep?: number
): number {
  if (!requirements.hasBudgetSettings) {
    return 1;
  }
  if (!requirements.hasSavingsTarget) {
    return 2;
  }

  const step = requestedStep ?? 3;
  if (step < 3) {
    return 3;
  }
  if (step > 4) {
    return 4;
  }
  return step;
}

export function onboardingPath(requirements: OnboardingRequirements): string {
  const step = resolveOnboardingStep(requirements);
  return `/onboarding?step=${step}`;
}

/**
 * Redirect targets:
 * - Incomplete → earliest missing step (1 or 2), or step 3+ when both exist
 * - Complete → /today unless explicitly on optional steps 3–4
 */
export function shouldRedirectCompletedUserAwayFromStep(
  requirements: OnboardingRequirements,
  step: number
): boolean {
  return isOnboardingComplete(requirements) && step < 3;
}
