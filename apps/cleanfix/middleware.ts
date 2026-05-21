import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/sign-up", "/", "/api/health"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();
  const headers = response.headers;

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );

  // Security headers
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-DNS-Prefetch-Control", "on");
  headers.set("Cache-Control", "no-store, max-age=0");

  // Public paths bypass auth
  if (PUBLIC_PATHS.includes(pathname)) {
    return response;
  }

  // Auth check — validate demo_login cookie
  const token = req.cookies.get("demo_login")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token format (cf_ prefix + timestamp)
  const parts = token.split("_");
  if (parts.length !== 3 || !token.startsWith("cf_")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "invalid_token");
    const clearResp = NextResponse.redirect(loginUrl);
    clearResp.cookies.set("demo_login", "", { maxAge: 0, path: "/" });
    clearResp.cookies.set("user", "", { maxAge: 0, path: "/" });
    return clearResp;
  }

  // Check session timeout (24 hours)
  const ts = parseInt(parts[2], 10);
  if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "session_expired");
    const clearResp = NextResponse.redirect(loginUrl);
    clearResp.cookies.set("demo_login", "", { maxAge: 0, path: "/" });
    clearResp.cookies.set("user", "", { maxAge: 0, path: "/" });
    return clearResp;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
