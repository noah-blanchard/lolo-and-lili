import { ApiError, ErrorCode } from "./result";

/**
 * Minimal fixed-window rate limiter, keyed by user id + bucket name.
 *
 * TRADE-OFF: the window state lives in a module-level Map, so limits are
 * enforced *per server instance* and reset on cold start. This is sufficient
 * for this app's threat model (invite-code guessing, push-bombing between two
 * partners) on a single-instance / low-scale deployment. If this ever runs
 * multi-instance or fully serverless, move the window into a shared store (e.g.
 * a `rate_limits` table written via an upsert RPC) — the `rateLimit` call sites
 * and the thrown RATE_LIMITED error stay identical.
 */

interface Bucket {
  expiresAt: number;
  count: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/**
 * Consume one unit from the caller's bucket. Throws `RATE_LIMITED` (429) when
 * the budget for the current window is exhausted; otherwise returns normally.
 */
export function rateLimit(
  userId: string,
  bucket: string,
  { limit, windowMs }: RateLimitOptions,
): void {
  const key = `${bucket}:${userId}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.expiresAt) {
    buckets.set(key, { expiresAt: now + windowMs, count: 1 });
    sweep(now);
    return;
  }

  if (existing.count >= limit) {
    throw new ApiError(
      ErrorCode.RATE_LIMITED,
      "Too many requests — please slow down and try again shortly",
    );
  }

  existing.count += 1;
}

/**
 * Opportunistically drop expired windows so the Map can't grow unbounded on a
 * long-lived instance. Cheap and only runs once the map is non-trivial.
 */
function sweep(now: number): void {
  if (buckets.size < 128) return;
  for (const [key, b] of buckets) {
    if (now >= b.expiresAt) buckets.delete(key);
  }
}
