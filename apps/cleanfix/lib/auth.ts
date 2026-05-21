import { cookies } from "next/headers";

const COOKIE_NAME = "demo_login";
const USER_COOKIE = "user";

export function getAuthToken(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

export function getUserFromCookie(): { name: string; email: string; role: string } | null {
  try {
    const raw = cookies().get(USER_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isTokenValid(token?: string): boolean {
  if (!token) return false;
  const parts = token.split("_");
  if (parts.length !== 3 || !token.startsWith("cf_")) return false;
  const ts = parseInt(parts[2], 10);
  if (isNaN(ts)) return false;
  return Date.now() - ts <= 24 * 60 * 60 * 1000;
}

export function isAuthenticated(): boolean {
  return isTokenValid(getAuthToken());
}

export function requireAuth(): { token: string; user: { name: string; email: string; role: string } } | null {
  const token = getAuthToken();
  if (!isTokenValid(token)) return null;
  const user = getUserFromCookie();
  if (!user) return null;
  return { token, user };
}

export function setSecureSession(
  token: string,
  user: { name: string; email: string; role: string }
) {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  };
  cookies().set(COOKIE_NAME, token, opts);
  cookies().set(USER_COOKIE, JSON.stringify(user), opts);
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  cookies().set(USER_COOKIE, "", { maxAge: 0, path: "/" });
}
