"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "demo_login";
const USER_COOKIE = "user";

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export async function getServerAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function getServerUserFromCookie(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(USER_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function serverRequireAuth(): Promise<{ token: string; user: AuthUser } | null> {
  const token = await getServerAuthToken();
  if (!token) return null;
  const parts = token.split("_");
  if (parts.length !== 3 || !token.startsWith("cf_")) return null;
  const ts = parseInt(parts[2], 10);
  if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) return null;
  const user = await getServerUserFromCookie();
  if (!user) return null;
  return { token, user };
}

export async function setSecureSession(
  token: string,
  user: AuthUser
) {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60,
    path: "/",
  };
  cookieStore.set(COOKIE_NAME, token, opts);
  cookieStore.set(USER_COOKIE, JSON.stringify(user), opts);
}

export async function clearServerSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  cookieStore.set(USER_COOKIE, "", { maxAge: 0, path: "/" });
}
