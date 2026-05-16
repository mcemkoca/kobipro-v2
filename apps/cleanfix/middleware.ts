import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
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

function getRoleFromClaims(sessionClaims: Record<string, unknown> | null | undefined): string | undefined {
  const metadata = sessionClaims?.metadata as Record<string, string> | undefined;
  return metadata?.role;
}

export default clerkMiddleware(async (auth, req) => {
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
