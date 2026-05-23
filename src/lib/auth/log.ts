export type AuthLogEvent =
  | "auth_redirect_to_login"
  | "auth_login_success"
  | "auth_login_failed"
  | "auth_signup_success"
  | "auth_signup_failed"
  | "auth_signup_requires_confirmation"
  | "login_page_with_auth_cookie"
  | "onboarding_incomplete_redirect";

type AuthLogPayload = Record<string, string | number | boolean | undefined>;

/** Structured server-side auth logs. Never log tokens, cookies, email, or financial data. */
export function authLog(event: AuthLogEvent, payload: AuthLogPayload = {}): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const entry = {
    event,
    ts: new Date().toISOString(),
    ...payload,
  };

  console.info("[burnline:auth]", JSON.stringify(entry));
}
