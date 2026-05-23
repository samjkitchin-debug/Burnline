import { calculateBudget } from "@/lib/budget/calculateBudget";
import { deriveTrackingStartDate } from "@/lib/budget/positions";
import { estimateBillStreamAmountCents } from "@/lib/budget/billEstimates";
import { parseDateOnly } from "@/lib/budget/payCycles";
import type {
  BillStreamInput,
  BudgetCalculationInput,
  BudgetSnapshot,
  ManualSpendInput,
} from "@/lib/budget/types";
import {
  parseCurrency,
  parseIncomeFrequency,
  parseRecurringFrequency,
  parseSavingsFrequency,
} from "@/lib/db/domain";
import {
  DEFAULT_TIMEZONE,
  getReferenceDateInTimezone,
  getTodayDateStringInTimezone,
} from "@/lib/dates/timezone";
import { loadProfileFinancial } from "@/lib/profile/financial";
import type { OnboardingRequirements } from "@/lib/onboarding/status";
import { getServerUserId } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isOnboardingComplete } from "@/lib/onboarding/status";

export type { OnboardingRequirements };

/** @deprecated Prefer getServerUserId from @/lib/auth/server */
export async function getAuthUserId(): Promise<string | null> {
  return getServerUserId();
}

export async function loadProfileTimezone(userId: string): Promise<string> {
  const profile = await loadProfileFinancial(userId);
  return profile.timezone;
}

export async function getUserReferenceDate(
  now: Date = new Date()
): Promise<{ referenceDate: Date; timezone: string; today: string }> {
  const userId = await getAuthUserId();
  const timezone = userId
    ? await loadProfileTimezone(userId)
    : DEFAULT_TIMEZONE;
  const today = getTodayDateStringInTimezone(timezone, now);
  return {
    timezone,
    today,
    referenceDate: getReferenceDateInTimezone(timezone, now),
  };
}

export async function getOnboardingRequirements(
  userId: string
): Promise<OnboardingRequirements> {
  const supabase = await createSupabaseServerClient();
  const [settings, savings] = await Promise.all([
    supabase
      .from("budget_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("savings_targets")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    hasBudgetSettings: Boolean(settings.data),
    hasSavingsTarget: Boolean(savings.data),
  };
}

export async function hasCompletedOnboarding(
  userId: string
): Promise<boolean> {
  const requirements = await getOnboardingRequirements(userId);
  return isOnboardingComplete(requirements);
}

export async function loadBudgetSnapshot(
  referenceDate?: Date
): Promise<{ snapshot: BudgetSnapshot | null; userId: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { snapshot: null, userId: null };
  }

  const profileFinancial = await loadProfileFinancial(userId);
  const ref =
    referenceDate ??
    getReferenceDateInTimezone(profileFinancial.timezone);

  const supabase = await createSupabaseServerClient();

  const [
    profileRes,
    settingsRes,
    savingsRes,
    streamsRes,
    paymentsRes,
    spendsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("currency").eq("id", userId).single(),
    supabase
      .from("budget_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("savings_targets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("bill_streams").select("*").eq("user_id", userId),
    supabase.from("bill_payments").select("*").eq("user_id", userId),
    supabase.from("manual_spends").select("*").eq("user_id", userId),
  ]);

  if (!settingsRes.data || !savingsRes.data) {
    return { snapshot: null, userId };
  }

  const currency = parseCurrency(
    profileRes.data?.currency ?? profileFinancial.currency
  );

  const paymentsByStream = new Map<string, typeof paymentsRes.data>();

  for (const payment of paymentsRes.data ?? []) {
    const list = paymentsByStream.get(payment.bill_stream_id) ?? [];
    list.push(payment);
    paymentsByStream.set(payment.bill_stream_id, list);
  }

  const billStreams: BillStreamInput[] = (streamsRes.data ?? []).map(
    (stream) => {
      const streamPayments = (paymentsByStream.get(stream.id) ?? []).map(
        (p) => ({
          billStreamId: p.bill_stream_id,
          amountCents: p.amount_cents,
          paidOn: parseDateOnly(p.paid_on),
        })
      );
      const estimated = estimateBillStreamAmountCents(
        parseRecurringFrequency(stream.frequency),
        stream.estimated_amount_cents,
        streamPayments
      );
      return {
        id: stream.id,
        name: stream.name,
        frequency: parseRecurringFrequency(stream.frequency),
        estimatedAmountCents: estimated,
        isActive: stream.is_active,
      };
    }
  );

  const manualSpends: ManualSpendInput[] = (spendsRes.data ?? []).map(
    (s) => ({
      amountCents: s.amount_cents,
      spentOn: parseDateOnly(s.spent_on),
    })
  );

  const input: BudgetCalculationInput = {
    settings: {
      incomeAmountCents: settingsRes.data.income_amount_cents,
      incomeFrequency: parseIncomeFrequency(settingsRes.data.income_frequency),
      nextPayday: parseDateOnly(settingsRes.data.next_payday),
    },
    savings: {
      amountCents: savingsRes.data.amount_cents,
      frequency: parseSavingsFrequency(savingsRes.data.frequency),
    },
    billStreams,
    manualSpends,
    trackingStartDate: deriveTrackingStartDate(
      manualSpends,
      profileFinancial.trackingStartDate,
      ref
    ),
    referenceDate: ref,
    currency,
  };

  return { snapshot: calculateBudget(input), userId };
}

export async function loadTodayManualSpends() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const { today } = await getUserReferenceDate();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("manual_spends")
    .select("id, amount_cents, category, note, spent_on")
    .eq("user_id", userId)
    .eq("spent_on", today)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function loadBillStreamsWithPayments() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const supabase = await createSupabaseServerClient();
  const { data: streams } = await supabase
    .from("bill_streams")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (!streams?.length) return [];

  const { data: payments } = await supabase
    .from("bill_payments")
    .select("*")
    .eq("user_id", userId)
    .order("paid_on", { ascending: false });

  return streams.map((stream) => ({
    stream,
    payments: (payments ?? []).filter((p) => p.bill_stream_id === stream.id),
  }));
}

export async function loadSettingsData() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const supabase = await createSupabaseServerClient();
  const [profile, settings, savings] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("budget_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("savings_targets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    profile: profile.data,
    settings: settings.data,
    savings: savings.data,
  };
}
