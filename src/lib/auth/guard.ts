import { redirect } from "next/navigation";
import { getOnboardingRequirements } from "@/lib/data/loadBudget";
import {
  isOnboardingComplete,
  resolveOnboardingStep,
  shouldRedirectCompletedUserAwayFromStep,
} from "@/lib/onboarding/status";
import { authLog } from "./log";
import {
  appendNextToPath,
  loginPath,
  sanitizeNext,
} from "./redirect";
import { getServerUserId } from "./server";

/**
 * Shared server-side guard for protected app routes.
 * Client components must not perform access control.
 */
export async function guardAuthenticatedAppRoute(
  routePath: string
): Promise<{ userId: string }> {
  const next = sanitizeNext(routePath);
  const userId = await getServerUserId();

  if (!userId) {
    authLog("auth_redirect_to_login", { route: next });
    redirect(loginPath(next));
  }

  const requirements = await getOnboardingRequirements(userId);
  if (!isOnboardingComplete(requirements)) {
    authLog("onboarding_incomplete_redirect", { route: next });
    const step = resolveOnboardingStep(requirements);
    redirect(appendNextToPath(`/onboarding?step=${step}`, next));
  }

  return { userId };
}

/** Auth required; onboarding may be incomplete (onboarding route only). */
export async function guardAuthenticated(
  routePath: string
): Promise<{ userId: string }> {
  const next = sanitizeNext(routePath);
  const userId = await getServerUserId();

  if (!userId) {
    authLog("auth_redirect_to_login", { route: next });
    redirect(loginPath(next));
  }

  return { userId };
}

export async function guardOnboardingPage(options: {
  requestedStep: number;
  next?: string | null;
}): Promise<{
  userId: string;
  resolvedStep: number;
}> {
  const { userId } = await guardAuthenticated(
    appendNextToPath("/onboarding", options.next)
  );
  const requirements = await getOnboardingRequirements(userId);
  const safeNext = sanitizeNext(options.next);

  if (shouldRedirectCompletedUserAwayFromStep(requirements, options.requestedStep)) {
    redirect(safeNext);
  }

  const resolvedStep = resolveOnboardingStep(requirements, options.requestedStep);

  if (resolvedStep !== options.requestedStep) {
    redirect(appendNextToPath(`/onboarding?step=${resolvedStep}`, safeNext));
  }

  return { userId, resolvedStep };
}
