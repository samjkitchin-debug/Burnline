import {
  isOnboardingComplete,
  onboardingPath,
  type OnboardingRequirements,
} from "@/lib/onboarding/status";
import { getOnboardingRequirements } from "@/lib/data/loadBudget";
import { getServerUserId } from "./server";

const DEFAULT_AFTER_AUTH = "/today";

/** Internal app paths only. Rejects external URLs and protocol-relative paths. */
export function sanitizeNext(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") {
    return DEFAULT_AFTER_AUTH;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_AFTER_AUTH;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return DEFAULT_AFTER_AUTH;
  }

  return trimmed.split("?")[0].length > 0 ? trimmed : DEFAULT_AFTER_AUTH;
}

export function loginPath(next?: string): string {
  const safe = sanitizeNext(next);
  if (safe === DEFAULT_AFTER_AUTH && !next) {
    return "/login";
  }
  return `/login?next=${encodeURIComponent(safe)}`;
}

export function onboardingPathWithNext(
  requirements: OnboardingRequirements,
  next?: string
): string {
  const base = onboardingPath(requirements);
  const safe = sanitizeNext(next);
  return `${base}&next=${encodeURIComponent(safe)}`;
}

/** Post-login / post-signup / login-page bounce destination. */
export async function resolvePostAuthDestination(
  next?: string | null
): Promise<string> {
  const userId = await getServerUserId();
  const safeNext = sanitizeNext(next);

  if (!userId) {
    return loginPath(safeNext);
  }

  const requirements = await getOnboardingRequirements(userId);
  if (!isOnboardingComplete(requirements)) {
    return onboardingPathWithNext(requirements, safeNext);
  }

  return safeNext;
}

export function appendNextToPath(path: string, next?: string | null): string {
  if (!next) {
    return path;
  }
  const safe = sanitizeNext(next);
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}next=${encodeURIComponent(safe)}`;
}
