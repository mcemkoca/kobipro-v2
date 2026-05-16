import { auth as clerkAuth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function getRoleFromClaims(sessionClaims: Record<string, unknown> | null | undefined): string {
  const metadata = sessionClaims?.metadata as Record<string, string> | undefined;
  return metadata?.role ?? "CUSTOMER";
}

export async function auth() {
  return clerkAuth();
}

export async function requireAuth() {
  const { userId } = await clerkAuth();
  if (!userId) {
    redirect("/login");
  }
  return { userId };
}

export async function requireRole(allowedRoles: string[]) {
  const { userId, sessionClaims } = await clerkAuth();

  if (!userId) {
    redirect("/login");
  }

  const role = getRoleFromClaims(sessionClaims);

  if (!allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return { userId, role };
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireManagerOrAbove() {
  return requireRole(["ADMIN", "MANAGER"]);
}
