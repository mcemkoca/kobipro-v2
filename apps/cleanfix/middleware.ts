import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "/favicon.ico",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

function getRoleFromClaims(
  sessionClaims: Record<string, unknown> | null | undefined
): string | undefined {
  const metadata = sessionClaims?.metadata as Record<string, string> | undefined;
  return metadata?.role;
}

// Plain middleware for demo mode (no Clerk auth)
async function demoMiddleware(req: NextRequest) {
  return NextResponse.next();
}

// Full Clerk middleware for production
const clerkAuthMiddleware = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (!isPublicRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isAdminRoute(req)) {
      const role = getRoleFromClaims(sessionClaims);
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export default DEMO_MODE ? demoMiddleware : clerkAuthMiddleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
