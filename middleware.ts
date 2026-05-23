/**
 * WARNING: This file runs in the Edge Runtime on Vercel.
 * Do not import server-only modules, next/headers, route guards, data loaders,
 * Node APIs, or @/lib/supabase/server — only edge-middleware.ts below.
 *
 * Session proxy: refreshes auth cookies via getUser(). Never redirect.
 * Route guards own access control. See docs/architecture/auth-session.md
 */
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/edge-middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
