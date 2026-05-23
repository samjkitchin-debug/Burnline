"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendNextToPath } from "@/lib/auth/redirect";
import { getServerUserId } from "@/lib/auth/server";
import {
  isNextRedirectError,
  toUserSafeActionError,
} from "@/lib/actions/errors";
import {
  parseCurrency,
  parseIncomeFrequency,
  parseProfileTimezone,
  parseRecurringFrequency,
  parseSavingsFrequency,
} from "@/lib/db/domain";
import { getTodayDateStringInTimezone } from "@/lib/dates/timezone";
import { loadProfileTimezone } from "@/lib/data/loadBudget";
import { setTrackingStartDateIfUnset } from "@/lib/profile/financial";
import { parseDollarsToCents } from "@/lib/money/parseDollarsToCents";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function readNextFromForm(formData: FormData): string | undefined {
  const value = formData.get("next");
  return value ? String(value) : undefined;
}

function readSpentOnFromForm(
  formData: FormData,
  fallbackDate: string
): string {
  const value = String(formData.get("spent_on") ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallbackDate;
}

async function requireUserId(): Promise<string> {
  const userId = await getServerUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

async function requireOwnedBillStream(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  billStreamId: string
): Promise<{ error: string } | null> {
  const { data, error } = await supabase
    .from("bill_streams")
    .select("id")
    .eq("id", billStreamId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { error: "Bill stream not found" };
  }
  return null;
}

function onboardingErrorPath(
  step: number,
  message: string,
  next?: string
): string {
  const base = `/onboarding?step=${step}&error=${encodeURIComponent(message)}`;
  return appendNextToPath(base, next);
}

export async function saveOnboardingIncome(
  formData: FormData
): Promise<void> {
  const next = readNextFromForm(formData);
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();
    const amountCents = parseDollarsToCents(String(formData.get("amount")));
    const frequency = parseIncomeFrequency(formData.get("frequency"));
    const nextPayday = String(formData.get("next_payday"));
    const currency = parseCurrency(formData.get("currency"));
    const timezone = parseProfileTimezone(formData.get("timezone"));

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      currency,
      timezone,
      updated_at: new Date().toISOString(),
    });
    if (profileError) {
      redirect(onboardingErrorPath(1, profileError.message, next));
    }

    const { error } = await supabase.from("budget_settings").upsert(
      {
        user_id: userId,
        income_amount_cents: amountCents,
        income_frequency: frequency,
        next_payday: nextPayday,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      redirect(onboardingErrorPath(1, error.message, next));
    }

    redirect(appendNextToPath("/onboarding?step=2", next));
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    redirect(
      onboardingErrorPath(1, toUserSafeActionError(error), next)
    );
  }
}

export async function saveOnboardingSavings(
  formData: FormData
): Promise<void> {
  const next = readNextFromForm(formData);
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();
    const amountCents = parseDollarsToCents(String(formData.get("amount")));
    const frequency = parseSavingsFrequency(formData.get("frequency"));

    const existing = await supabase
      .from("savings_targets")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing.data?.id) {
      const { error } = await supabase
        .from("savings_targets")
        .update({
          amount_cents: amountCents,
          frequency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.data.id);
      if (error) {
        redirect(onboardingErrorPath(2, error.message, next));
      }
    } else {
      const { error } = await supabase.from("savings_targets").insert({
        user_id: userId,
        amount_cents: amountCents,
        frequency,
      });
      if (error) {
        redirect(onboardingErrorPath(2, error.message, next));
      }
    }

    redirect(appendNextToPath("/onboarding?step=3", next));
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    redirect(
      onboardingErrorPath(2, toUserSafeActionError(error), next)
    );
  }
}

export async function addBillStream(formData: FormData): Promise<void> {
  const next = readNextFromForm(formData);
  const returnTo = String(formData.get("return_to") ?? "fixed-costs");
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("bill_streams").insert({
      user_id: userId,
      name: String(formData.get("name")),
      category: String(formData.get("category") ?? "Other"),
      frequency: parseRecurringFrequency(formData.get("frequency")),
      estimated_amount_cents: parseDollarsToCents(String(formData.get("amount"))),
    });
    if (error) {
      if (returnTo === "onboarding") {
        redirect(onboardingErrorPath(3, error.message, next));
      }
      redirect(`/fixed-costs?error=${encodeURIComponent(error.message)}`);
    }
    revalidatePath("/onboarding");
    revalidatePath("/fixed-costs");
    revalidatePath("/today");
    if (returnTo === "onboarding") {
      redirect(appendNextToPath("/onboarding?step=3", next));
    }
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    const message = toUserSafeActionError(error);
    if (returnTo === "onboarding") {
      redirect(onboardingErrorPath(3, message, next));
    }
    redirect(`/fixed-costs?error=${encodeURIComponent(message)}`);
  }
}

export async function finalizeOnboardingAndStart(
  formData: FormData
): Promise<void> {
  const next = readNextFromForm(formData);
  try {
    const userId = await requireUserId();
    const timezone = await loadProfileTimezone(userId);
    await setTrackingStartDateIfUnset(userId, timezone);
    revalidatePath("/today");
    redirect(appendNextToPath("/today", next));
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    redirect(
      onboardingErrorPath(4, toUserSafeActionError(error), next)
    );
  }
}

export async function addManualSpend(
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();
    const timezone = await loadProfileTimezone(userId);
    const today = getTodayDateStringInTimezone(timezone);
    const spentOn = readSpentOnFromForm(formData, today);

    const { error } = await supabase.from("manual_spends").insert({
      user_id: userId,
      amount_cents: parseDollarsToCents(String(formData.get("amount"))),
      category: String(formData.get("category")),
      note: String(formData.get("note") ?? "") || null,
      spent_on: spentOn,
    });
    if (error) return { error: error.message };
    revalidatePath("/today");
    return {};
  } catch (error) {
    return { error: toUserSafeActionError(error) };
  }
}

export async function addBillPayment(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();
    const billStreamId = String(formData.get("bill_stream_id"));
    const owned = await requireOwnedBillStream(supabase, userId, billStreamId);
    if (owned) {
      redirect(
        `/fixed-costs?error=${encodeURIComponent(owned.error)}`
      );
    }

    const { error } = await supabase.from("bill_payments").insert({
      user_id: userId,
      bill_stream_id: billStreamId,
      amount_cents: parseDollarsToCents(String(formData.get("amount"))),
      paid_on: String(formData.get("paid_on")),
      note: String(formData.get("note") ?? "") || null,
    });
    if (error) {
      redirect(`/fixed-costs?error=${encodeURIComponent(error.message)}`);
    }
    revalidatePath("/fixed-costs");
    revalidatePath("/today");
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    redirect(
      `/fixed-costs?error=${encodeURIComponent(toUserSafeActionError(error))}`
    );
  }
}

export async function updateBillStream(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();
    const id = String(formData.get("id"));
    const { error } = await supabase
      .from("bill_streams")
      .update({
        name: String(formData.get("name")),
        category: String(formData.get("category")),
        frequency: parseRecurringFrequency(formData.get("frequency")),
        estimated_amount_cents: parseDollarsToCents(
          String(formData.get("amount"))
        ),
        is_active: formData.get("is_active") === "true",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      redirect(`/fixed-costs?error=${encodeURIComponent(error.message)}`);
    }
    revalidatePath("/fixed-costs");
    revalidatePath("/today");
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    redirect(
      `/fixed-costs?error=${encodeURIComponent(toUserSafeActionError(error))}`
    );
  }
}

export async function spreadSpendAsBill(
  formData: FormData
): Promise<{ error?: string; billStreamId?: string }> {
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();
    const timezone = await loadProfileTimezone(userId);
    const today = getTodayDateStringInTimezone(timezone);
    const streamId = formData.get("bill_stream_id");
    const frequency = parseRecurringFrequency(formData.get("frequency"));
    const amountCents = parseDollarsToCents(String(formData.get("amount")));
    const name = String(formData.get("name"));
    const category = String(formData.get("category") ?? "Bills");
    const paidOn = readSpentOnFromForm(formData, today);

    let billStreamId = streamId ? String(streamId) : null;

    if (!billStreamId) {
      const { data, error } = await supabase
        .from("bill_streams")
        .insert({
          user_id: userId,
          name,
          category,
          frequency,
          estimated_amount_cents: amountCents,
        })
        .select("id")
        .single();
      if (error) return { error: error.message };
      billStreamId = data.id;
    } else {
      const owned = await requireOwnedBillStream(
        supabase,
        userId,
        billStreamId
      );
      if (owned) return owned;

      const { data: updated, error: updateError } = await supabase
        .from("bill_streams")
        .update({
          estimated_amount_cents: amountCents,
          updated_at: new Date().toISOString(),
        })
        .eq("id", billStreamId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (updateError || !updated) {
        return { error: "Bill stream not found" };
      }
    }

    const { error: payError } = await supabase.from("bill_payments").insert({
      user_id: userId,
      bill_stream_id: billStreamId!,
      amount_cents: amountCents,
      paid_on: paidOn,
    });
    if (payError) return { error: payError.message };

    revalidatePath("/today");
    revalidatePath("/fixed-costs");
    return { billStreamId: billStreamId ?? undefined };
  } catch (error) {
    return { error: toUserSafeActionError(error) };
  }
}

export async function updateSettings(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const supabase = await createSupabaseServerClient();

    const currency = parseCurrency(formData.get("currency"));
    const timezone = parseProfileTimezone(formData.get("timezone"));

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        currency,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      redirect(
        `/settings?error=${encodeURIComponent(profileError.message)}`
      );
    }

    const settings = await supabase
      .from("budget_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (settings.data?.id) {
      const { error } = await supabase
        .from("budget_settings")
        .update({
          income_amount_cents: parseDollarsToCents(
            String(formData.get("income_amount"))
          ),
          income_frequency: parseIncomeFrequency(
            formData.get("income_frequency")
          ),
          next_payday: String(formData.get("next_payday")),
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.data.id);
      if (error) {
        redirect(`/settings?error=${encodeURIComponent(error.message)}`);
      }
    }

    const savings = await supabase
      .from("savings_targets")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (savings.data?.id) {
      const { error } = await supabase
        .from("savings_targets")
        .update({
          amount_cents: parseDollarsToCents(
            String(formData.get("savings_amount"))
          ),
          frequency: parseSavingsFrequency(formData.get("savings_frequency")),
          updated_at: new Date().toISOString(),
        })
        .eq("id", savings.data.id);
      if (error) {
        redirect(`/settings?error=${encodeURIComponent(error.message)}`);
      }
    }

    revalidatePath("/settings");
    revalidatePath("/today");
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    redirect(
      `/settings?error=${encodeURIComponent(toUserSafeActionError(error))}`
    );
  }
}
