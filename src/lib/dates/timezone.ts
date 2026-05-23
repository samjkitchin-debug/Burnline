import { parseDateOnly } from "@/lib/budget/payCycles";
import { PROFILE_TIMEZONES } from "@/lib/constants";

export const DEFAULT_TIMEZONE = "Asia/Singapore";

/** Calendar date YYYY-MM-DD for an instant in an IANA timezone. */
export function toDateOnlyStringInTimezone(
  instant: Date,
  timeZone: string
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Could not format date for timezone ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
}

export function getTodayDateStringInTimezone(
  timeZone: string,
  now: Date = new Date()
): string {
  return toDateOnlyStringInTimezone(now, timeZone);
}

/** Alias for budget/spend code paths that expect a date-only string name. */
export function getTodayDateOnlyInTimezone(
  timeZone: string,
  now: Date = new Date()
): string {
  return getTodayDateStringInTimezone(timeZone, now);
}

/** Browser IANA timezone for onboarding default; falls back to Singapore. */
export function resolveDeviceTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return normalizeTimezone(tz);
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** Reference calendar day for budget/today logic in the user's timezone. */
export function getReferenceDateInTimezone(
  timeZone: string,
  now: Date = new Date()
): Date {
  return parseDateOnly(getTodayDateStringInTimezone(timeZone, now));
}

/** Browser local calendar day — use when submitting spent_on from the client. */
export function getClientLocalDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isValidTimezone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimezone(
  timeZone: string | null | undefined
): string {
  const value = timeZone?.trim();
  if (value && isValidTimezone(value)) {
    return value;
  }
  return DEFAULT_TIMEZONE;
}

/** Settings/onboarding options: curated list plus stored and device timezones. */
export function buildProfileTimezoneOptions(
  storedTimezone: string,
  deviceTimezone?: string
): string[] {
  const options: string[] = [...PROFILE_TIMEZONES];
  const add = (tz: string | null | undefined) => {
    const normalized = normalizeTimezone(tz);
    if (!options.includes(normalized)) {
      options.push(normalized);
    }
  };
  add(storedTimezone);
  if (deviceTimezone) {
    add(deviceTimezone);
  }
  return options;
}
