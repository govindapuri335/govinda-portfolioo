import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Proxy (formerly Middleware) guards the admin area. Because
 * iron-session cookies are AES-encrypted and can't be verified at the edge
 * without the secret, this proxy only performs a *presence check* on the
 * session cookie. The real authentication check (decrypt + `isAdmin`)
 * happens inside each admin page/route via `isAuthenticated()`.
 *
 * The presence check is enough to prevent unauthenticated users from ever
 * hitting the admin pages, and it avoids a redirect loop on `/admin/login`.
 */
const COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE_NAME || "portfolio_admin";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never guard the login page or auth endpoints — those must be reachable.
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout")
  ) {
    return NextResponse.next();
  }

  const hasCookie = Boolean(req.cookies.get(COOKIE_NAME)?.value);
  if (!hasCookie) {
    // For page requests, redirect to login. For API requests, return 401 JSON.
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
