"use server";

import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

const DEMO_COOKIE = "demo_login";

export interface DemoUser {
  name: string;
  email: string;
  role: string;
}

export async function getDemoUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as DemoUser;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<DemoUser> {
  const user = await getDemoUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function getUserRole(): Promise<string> {
  const user = await getDemoUser();
  return user?.role ?? "CUSTOMER";
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

export async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}
