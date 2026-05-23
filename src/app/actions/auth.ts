"use server";

import { redirect } from "next/navigation";
import { authLog } from "@/lib/auth/log";
import { resolvePostAuthDestination, sanitizeNext } from "@/lib/auth/redirect";
import { signupRequiresConfirmation } from "@/lib/auth/signup";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  message?: string;
};

function failureReason(message: string): string {
  return message.slice(0, 120);
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? ""),
    intent: String(formData.get("intent") ?? ""),
  };
}

/** v1: email + password only. No OTP, magic link, or OAuth. */
export async function passwordAuthAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password, next, intent } = readCredentials(formData);

  if (!email || !password) {
    const event =
      intent === "signup" ? "auth_signup_failed" : "auth_login_failed";
    authLog(event, { reason: "missing_fields" });
    return { error: "Email and password are required." };
  }

  if (intent !== "login" && intent !== "signup") {
    return { error: "Choose log in or create account." };
  }

  const supabase = await createSupabaseServerClient();

  if (intent === "login") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      authLog("auth_login_failed", { reason: failureReason(error.message) });
      return { error: error.message };
    }

    authLog("auth_login_success", { route: sanitizeNext(next) });
    redirect(await resolvePostAuthDestination(next));
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    authLog("auth_signup_failed", { reason: failureReason(error.message) });
    return { error: error.message };
  }

  if (signupRequiresConfirmation(data.session)) {
    authLog("auth_signup_requires_confirmation", {
      route: sanitizeNext(next),
    });
    return {
      message:
        "Account created. Check your email to confirm, then log in.",
    };
  }

  authLog("auth_signup_success", { route: sanitizeNext(next) });
  redirect(await resolvePostAuthDestination(next));
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
