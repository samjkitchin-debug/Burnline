/** Sign-up returned no session (email confirmation required). */
export function signupRequiresConfirmation(session: unknown): boolean {
  return session == null;
}
