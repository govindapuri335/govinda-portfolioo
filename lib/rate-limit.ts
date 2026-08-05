import "server-only";

import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (url && token) {
  try {
    redis = new Redis({ url, token });
  } catch (e) {
    console.error("rate-limit: failed to init Upstash client", e);
    redis = null;
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Fixed-window rate limit backed by Upstash. If Upstash isn't configured this
 * fails open (always allows) — the admin password is still required, so this
 * is only a brute-force mitigation, not the primary defense.
 */
export async function limit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (!redis) {
    return { ok: true, remaining: max, resetInSeconds: windowSeconds };
  }
  const bucket = `ratelimit:${key}`;
  try {
    const count = await redis.incr(bucket);
    if (count === 1) {
      await redis.expire(bucket, windowSeconds);
    }
    const ttl = await redis.ttl(bucket);
    return {
      ok: count <= max,
      remaining: Math.max(0, max - count),
      resetInSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (e) {
    console.error("rate-limit: Upstash error, failing open", e);
    return { ok: true, remaining: max, resetInSeconds: windowSeconds };
  }
}
