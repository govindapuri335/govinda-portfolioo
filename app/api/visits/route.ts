import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { NextResponse } from "next/server";

// Environment-driven behavior: if VISITS_USE_UPSTASH is set to "true"
// we'll attempt to use Upstash for a persistent global counter. Otherwise
// we fall back to CountAPI which stores a single global counter.
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const VISITS_USE_UPSTASH =
  (process.env.VISITS_USE_UPSTASH ?? "false") === "true";

let redis: Redis | null = null;
if (VISITS_USE_UPSTASH && UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
  } catch (e) {
    console.error("Failed to initialize Upstash Redis client:", e);
    redis = null;
  }
}

// CounterAPI (v2) server-backed fallback / primary if configured
const COUNTERAPI_BASE = process.env.COUNTERAPI_BASE;
const COUNTERAPI_KEY = process.env.COUNTERAPI_KEY;

// How long (seconds) to cache the display value in Upstash for fast reads.
const VISITS_DISPLAY_CACHE_TTL = Number(
  process.env.VISITS_DISPLAY_CACHE_TTL ?? "30"
);

async function counterapiGet() {
  if (!COUNTERAPI_BASE || !COUNTERAPI_KEY) return null;
  try {
    const res = await fetch(COUNTERAPI_BASE, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${COUNTERAPI_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("CounterAPI GET failed:", e);
    return null;
  }
}

async function counterapiUp() {
  if (!COUNTERAPI_BASE || !COUNTERAPI_KEY) return null;
  try {
    // V2 API uses GET for the /up endpoint
    const res = await fetch(`${COUNTERAPI_BASE}/up`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${COUNTERAPI_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("CounterAPI UP failed:", e);
    return null;
  }
}

// CountAPI fallback (legacy)
async function countapiHitGlobal(namespace: string) {
  try {
    const res = await fetch(
      `https://api.countapi.xyz/hit/${encodeURIComponent(namespace)}/global`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
export async function GET(req: Request) {
  try {
    // Fast path: if we have Upstash and a cached display value, return it
    // immediately. This lets the site render quickly from CDN/edge cache
    // without waiting for CounterAPI on every request.
    if (redis) {
      try {
        const cached = await redis.get("visits:display");
        if (cached != null) {
          const global = Number(cached || 0);
          return NextResponse.json(
            { global },
            {
              headers: {
                "x-visits-backend": "upstash-cache",
                // Allow CDN/edge to cache this short-lived value and serve
                // fast; still revalidate after short TTL.
                "Cache-Control":
                  "public, max-age=0, s-maxage=10, stale-while-revalidate=59",
              },
            }
          );
        }
      } catch (e) {
        console.error("Upstash read for display cache failed:", e);
      }
    }

    // Prefer CounterAPI if configured
    if (COUNTERAPI_BASE && COUNTERAPI_KEY) {
      const res = await counterapiGet();
      // CounterAPI v2 returns numeric counts in data.up_count (or data.up_count)
      const global = Number(
        res?.data?.up_count ?? res?.data?.value ?? res?.value ?? 0
      );
      return NextResponse.json(
        { global },
        {
          headers: {
            "x-visits-backend": "counterapi",
            "Cache-Control":
              "public, max-age=0, s-maxage=10, stale-while-revalidate=59",
          },
        }
      );
    }

    // If Upstash is available, read from redis
    if (redis) {
      try {
        const g = await redis.get("visits:global");
        const global = Number(g || 0);
        return NextResponse.json(
          { global },
          {
            headers: {
              "x-visits-backend": "upstash",
              "Cache-Control":
                "public, max-age=0, s-maxage=10, stale-while-revalidate=59",
            },
          }
        );
      } catch (e) {
        console.error("Upstash GET failed:", e);
      }
    }

    // fallback to CountAPI read
    const g = await (async () => {
      try {
        const res = await fetch(
          `https://api.countapi.xyz/get/govinda-portfolio/global`
        );
        if (!res.ok) return null;
        return await res.json();
      } catch (_e) {
        return null;
      }
    })();
    const global = Number(g?.value ?? 0);
    return NextResponse.json(
      { global },
      {
        headers: {
          "x-visits-backend": "countapi",
          "Cache-Control":
            "public, max-age=0, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message || err), global: 0 },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const ip = await getIp(req);
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const recentKey = `visit:recent:${ipHash}`;
    const DEDUPE_TTL = Number(process.env.VISITS_DEDUPE_TTL_SECONDS ?? "3600");

    let shouldCount = false;
    try {
      if (DEDUPE_TTL <= 0) {
        shouldCount = true;
      } else if (redis) {
        const setRes: any = await redis.set(recentKey, "1", {
          ex: DEDUPE_TTL,
          nx: true,
        } as any);
        if (setRes === "OK" || setRes === true) shouldCount = true;
      } else {
        // No redis available to dedupe; best effort — count the visit
        shouldCount = true;
      }
    } catch (e) {
      console.error("Deduping failed:", e);
      shouldCount = true;
    }

    let global = 0;
    if (shouldCount) {
      // If Upstash is available, always record the unique visit there first
      // (this provides the IP-deduplicated unique counter you can inspect later).
      let upstashCount: number | null = null;
      if (redis) {
        try {
          const g = await redis.incr("visits:global");
          upstashCount = Number(g || 0);
        } catch (e) {
          console.error("Upstash INCR failed:", e);
          upstashCount = null;
        }
      }

      // Prefer CounterAPI for the value we show on the site (display). We still
      // increment Upstash above for unique tracking. CounterAPI v2 uses GET for
      // /up and returns the display count in data.up_count.
      if (COUNTERAPI_BASE && COUNTERAPI_KEY) {
        const res = await counterapiUp();
        global = Number(
          res?.data?.up_count ?? res?.data?.value ?? res?.value ?? 0
        );
        // Cache the display value in Upstash for fast subsequent reads.
        if (redis) {
          try {
            await redis.set("visits:display", String(global), {
              ex: VISITS_DISPLAY_CACHE_TTL,
            } as any);
          } catch (e) {
            console.error("Failed to set visits:display in Upstash:", e);
          }
        }
        // Return the CounterAPI display value, but expose the Upstash unique
        // count in a debug header when available.
        const headers: Record<string, string> = {
          "x-visits-backend": "counterapi",
          "Cache-Control":
            "public, max-age=0, s-maxage=10, stale-while-revalidate=59",
        };
        if (upstashCount !== null)
          headers["x-visits-unique"] = String(upstashCount);
        return NextResponse.json({ global }, { headers });
      }

      // If CounterAPI not configured, but Upstash increment succeeded, return
      // the Upstash unique count as the authoritative value to show.
      if (upstashCount !== null) {
        // Also keep the display cache in sync when we only have Upstash.
        if (redis) {
          try {
            await redis.set("visits:display", String(upstashCount), {
              ex: VISITS_DISPLAY_CACHE_TTL,
            } as any);
          } catch (_e) {}
        }
        return NextResponse.json(
          { global: upstashCount },
          {
            headers: {
              "x-visits-backend": "upstash",
              "Cache-Control":
                "public, max-age=0, s-maxage=10, stale-while-revalidate=59",
            },
          }
        );
      }

      // As a last resort, fall back to CountAPI hit
      const g = await countapiHitGlobal("govinda-portfolio");
      global = Number(g?.value ?? 0);
      return NextResponse.json(
        { global },
        { headers: { "x-visits-backend": "countapi" } }
      );
    }

    // Not counted due to dedupe — return current value
    const current = await (async () => {
      if (COUNTERAPI_BASE && COUNTERAPI_KEY) {
        const r = await counterapiGet();
        return Number(r?.data?.up_count ?? r?.data?.value ?? r?.value ?? 0);
      }
      if (redis) {
        const g = await redis.get("visits:global");
        return Number(g || 0);
      }
      const r = await fetch(
        `https://api.countapi.xyz/get/govinda-portfolio/global`
      ).catch(() => null);
      if (!r) return 0;
      const j = await r.json().catch(() => null);
      return Number(j?.value ?? 0);
    })();

    return NextResponse.json(
      { global: current },
      {
        headers: {
          "x-visits-backend": redis
            ? "upstash"
            : COUNTERAPI_BASE
              ? "counterapi"
              : "countapi",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message || err), global: 0 },
      { status: 500 }
    );
  }
}
