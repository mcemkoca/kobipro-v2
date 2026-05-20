import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/sign-up", "/", "/api/health"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Security headers for all responses
  const response = NextResponse.next();
  const headers = response.headers;

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // HTTPS enforcement (HSTS)
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // Permissions policy
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Auth redirect — check demo_login cookie
  if (PUBLIC_PATHS.includes(pathname)) {
    return response;
  }

  const token = req.cookies.get("demo_login")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
