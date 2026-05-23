/**
 * WARNING: This module runs in the Edge Runtime on Vercel.
 * Do not import server-only modules, next/headers, route guards, data loaders,
 * Node APIs, or broad app helpers (e.g. @/lib/env, @/lib/supabase/server).
 *
 * Cookie refresh only — never redirect; route guards own access control.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function publicEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = publicEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = publicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
