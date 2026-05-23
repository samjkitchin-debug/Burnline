import { parseDateOnly } from "@/lib/budget/payCycles";
import { parseCurrency, parseProfileTimezone } from "@/lib/db/domain";
import { getTodayDateStringInTimezone } from "@/lib/dates/timezone";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileFinancial = {
  currency: string;
  timezone: string;
  trackingStartDate: Date | null;
};

export function parseTrackingStartDate(
  value: string | null | undefined
): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  return parseDateOnly(value);
}

export async function loadProfileFinancial(
  userId: string
): Promise<ProfileFinancial> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("currency, timezone, tracking_start_date")
    .eq("id", userId)
    .maybeSingle();

  return {
    currency: parseCurrency(data?.currency),
    timezone: parseProfileTimezone(data?.timezone),
    trackingStartDate: parseTrackingStartDate(data?.tracking_start_date),
  };
}

/** Set tracking_start_date once when onboarding completes (profile timezone today). */
export async function setTrackingStartDateIfUnset(
  userId: string,
  timezone: string
): Promise<void> {
  const today = getTodayDateStringInTimezone(timezone);
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({
      tracking_start_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .is("tracking_start_date", null);
}
