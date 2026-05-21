import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/*
 * In-memory rate limiter for demo use.
 * Production: replace with Redis / Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;  // 60 requests per minute per IP

function getKey(identifier: string, prefix = "req"): string {
  return `${prefix}:${identifier}`;
}

function isAllowed(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

/* Clean up expired entries every 5 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60_000);

export function rateLimit(identifier: string) {
  return isAllowed(getKey(identifier, "req"));
}

export function rateLimitByAction(identifier: string, action: string, limit = 10) {
  return isAllowed(getKey(`${identifier}:${action}`, "act"));
}

export function applyRateLimitHeaders(
  response: NextResponse,
  result: { remaining: number; resetAt: number }
) {
  response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  return response;
}

export function rateLimitMiddleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const result = rateLimit(ip);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) } }
    );
  }

  return null; // allowed, continue
}
