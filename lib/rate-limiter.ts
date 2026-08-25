/**
 * In-memory sliding-window rate limiter for Stripe card operations
 * Protects against bot attacks, card testing, and brute-force attempts
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();
const emailMap = new Map<string, RateLimitRecord>();

// Cleanup stale records every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, val] of ipMap.entries()) {
        if (val.resetAt < now) ipMap.delete(key);
      }
      for (const [key, val] of emailMap.entries()) {
        if (val.resetAt < now) emailMap.delete(key);
      }
    },
    10 * 60 * 1000
  );
}

/**
 * Check if a request exceeds rate limit
 * @param key Identifier (IP or Email)
 * @param maxAttempts Max allowed attempts within window
 * @param windowMs Window in milliseconds (e.g. 10 minutes = 600,000 ms)
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 10 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  if (!key)
    return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };

  const now = Date.now();
  const map = key.includes("@") ? emailMap : ipMap;
  const record = map.get(key);

  if (!record || record.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Extract client IP from Next.js request headers
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}
