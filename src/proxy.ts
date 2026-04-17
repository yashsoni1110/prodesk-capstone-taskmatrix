import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected route prefixes — any path that starts with one of these
 * requires an authenticated Supabase session.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/kanban",
  "/projects",
  "/team",
  "/settings",
  "/activity",
];

/**
 * Public paths that should redirect to /dashboard when the user IS logged in.
 */
const PUBLIC_PATHS = ["/", "/login", "/register"];

/**
 * Supabase stores its session token in a cookie whose name ends with
 * "-auth-token" (e.g. sb-<project-ref>-auth-token).
 * We do an optimistic check here (no network round-trip) — the real
 * verification happens inside the app layout via initializeAuth().
 */
function hasSupabaseSession(req: NextRequest): boolean {
  // req.cookies is a ReadonlyRequestCookies – iterate with getAll()
  const allCookies = req.cookies.getAll();
  return allCookies.some((c) => c.name.endsWith("-auth-token") && !!c.value);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  const isPublic = PUBLIC_PATHS.includes(pathname);

  const hasSession = hasSupabaseSession(req);

  // 1. Unauthenticated user tries to access a protected route → send to login
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/", req.nextUrl);
    loginUrl.searchParams.set("next", pathname); // preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visits a public/auth page → send to dashboard
  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Run on all routes except Next.js internals and static assets
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
