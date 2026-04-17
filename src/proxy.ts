import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (Next.js 16 — formerly middleware.ts)
 *
 * NOTE on Supabase + localStorage:
 * The @supabase/supabase-js v2 SDK stores its session in **localStorage** by
 * default, not in HTTP cookies. That means the proxy (which only has access
 * to request cookies) cannot reliably detect an active session server-side
 * without also configuring Supabase with a custom cookie-based storage adapter
 * (e.g. @supabase/ssr).
 *
 * For the MVP we do NOT use @supabase/ssr, so we:
 *   1. Keep the proxy in place (required for Week 14 milestone).
 *   2. Handle /login and /register canonical redirects here.
 *   3. Pass all other traffic through — the client-side guard in
 *      src/app/(app)/layout.tsx intercepts unauthenticated users via
 *      initializeAuth() + useEffect redirect, which correctly reads the
 *      localStorage session.
 *
 * TODO (Week 15+): integrate @supabase/ssr to set auth cookies server-side
 * so this proxy can do proper optimistic route protection.
 */

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect /login → / (the combined auth page)
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Redirect /register → /?mode=register
  if (pathname === "/register") {
    const url = new URL("/", req.nextUrl);
    url.searchParams.set("mode", "register");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Run on all routes except Next.js internals and static assets
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
