import { auth } from "@clerk/nextjs/server";

function getRoleFromClaims(sessionClaims: Record<string, unknown> | null | undefined): string {
  const metadata = sessionClaims?.metadata as Record<string, string> | undefined;
  return metadata?.role ?? "CUSTOMER";
}

export async function getUserRole(): Promise<string> {
  const { sessionClaims } = await auth();
  return getRoleFromClaims(sessionClaims);
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "ADMIN";
}

export async function isManager(): Promise<boolean> {
  const role = await getUserRole();
  return role === "ADMIN" || role === "MANAGER";
}

export async function hasRole(allowedRoles: string[]): Promise<boolean> {
  const role = await getUserRole();
  return allowedRoles.includes(role);
}
