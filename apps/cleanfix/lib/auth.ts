"use client";

const COOKIE_NAME = "demo_login";
const USER_COOKIE = "user";

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function getAuthToken(): string | undefined {
  return getCookie(COOKIE_NAME);
}

export function getUserFromCookie(): AuthUser | null {
  if (typeof document === "undefined") return null;
  try {
    const raw = getCookie(USER_COOKIE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getDemoUser(): AuthUser | null {
  return getUserFromCookie();
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

export function hasRole(role: string | string[]): boolean {
  const user = getUserFromCookie();
  if (!user) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

export function isAdmin(): boolean {
  return hasRole("ADMIN");
}

export function requireAuth(): { token: string; user: AuthUser } | null {
  const token = getAuthToken();
  if (!isTokenValid(token)) return null;
  const user = getUserFromCookie();
  if (!user || !token) return null;
  return { token, user };
}

export function setSecureSession(
  token: string,
  user: AuthUser
) {
  const opts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `path=/`,
    `max-age=${24 * 60 * 60}`,
    `SameSite=Lax`,
  ];
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    opts.push("Secure");
  }
  document.cookie = opts.join("; ");

  const userOpts = [
    `${USER_COOKIE}=${encodeURIComponent(JSON.stringify(user))}`,
    `path=/`,
    `max-age=${24 * 60 * 60}`,
    `SameSite=Lax`,
  ];
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    userOpts.push("Secure");
  }
  document.cookie = userOpts.join("; ");
}

export function clearSession() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  document.cookie = `${USER_COOKIE}=; path=/; max-age=0`;
}
