import { createSupabaseServerClient } from "@/lib/supabase/server";

function isMissingPublicEnvError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.startsWith("Missing NEXT_PUBLIC_")
  );
}

/**
 * Server auth authority. Uses getUser() only — never getSession() for access control.
 * Fails closed on auth/session/cookie errors; missing env vars still throw.
 */
export async function getServerUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    if (isMissingPublicEnvError(error)) {
      throw error;
    }

    return null;
  }
}

export async function hasAuthCookie(): Promise<boolean> {
  return (await getServerUserId()) !== null;
}
