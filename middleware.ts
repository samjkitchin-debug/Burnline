/**
 * WARNING:
 * This file runs in the Vercel middleware/proxy runtime.
 * Keep it self-contained — do not import app helpers, route guards,
 * server auth helpers, next/headers, server-only, data loaders, or Node APIs.
 * Middleware refreshes Supabase cookies only and must fail open.
 * Route guards own access control. See docs/architecture/auth-session.md
 */
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return response;
    }

    // Validate the URL is well-formed before passing to createServerClient.
    try {
      new URL(supabaseUrl);
    } catch {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value);
          }

          response = NextResponse.next({ request });

          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    });

    await supabase.auth.getUser();

    return response;
  } catch {
    // Fail open — never let middleware crash the app.
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
