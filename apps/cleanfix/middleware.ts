import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Demo mode: no real Clerk keys needed
const DEMO_MODE =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_placeholder") ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_placeholder") ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/api/health",
  "/_next/(.*)",
  "/favicon.ico",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/bookings(.*)",
  "/customers(.*)",
  "/services(.*)",
  "/staff(.*)",
  "/invoices(.*)",
  "/reports(.*)",
  "/settings(.*)",
]);

function getRoleFromClaims(
  sessionClaims: Record<string, unknown> | null | undefined
): string | undefined {
  const metadata = sessionClaims?.metadata as Record<string, string> | undefined;
  return metadata?.role;
}

export default clerkMiddleware(async (auth, req) => {
  // Demo mode: allow everything
  if (DEMO_MODE) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  if (!isPublicRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin-only routes
    if (isAdminRoute(req)) {
      const role = getRoleFromClaims(sessionClaims);
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
