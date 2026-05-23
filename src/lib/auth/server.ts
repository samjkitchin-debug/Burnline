import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server auth authority. Uses getUser() only — never getSession() for access control.
 */
export async function getServerUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function hasAuthCookie(): Promise<boolean> {
  return (await getServerUserId()) !== null;
}
