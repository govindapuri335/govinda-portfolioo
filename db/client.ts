import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * We lazy-initialize the postgres client so `next build` (or any tooling that
 * imports this module without touching the DB) doesn't fail if DATABASE_URL
 * is missing. Any actual query will still throw a clear error.
 *
 * The client is cached on `globalThis` in dev so HMR reloads don't exhaust
 * connection slots.
 */
declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createDb() {
  // During `next build`, static pages are prerendered. We must NOT connect to
  // the DB then: the build machine may not reach it (and a slow/unreachable
  // DB otherwise hangs the build on the 60s pageless timeout). Runtime ISR
  // regenerates pages with real data; pages already fall back to static config.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error(
      "DB access is disabled during the static build phase. " +
        "Pages fall back to static/default content and are revalidated at runtime."
    );
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file (see .env.example)."
    );
  }
  const client =
    global.__pgClient ??
    postgres(connectionString, {
      // Pool size: a few connections so parallel queries (e.g. the admin
      // dashboard's Promise.allSettled batch) run concurrently instead of
      // queueing behind a single connection. Supabase's pooled endpoint
      // (pgbouncer transaction mode) handles this fine.
      max: 5,
      prepare: false, // safer on pooled connections (pgbouncer, Neon, etc.)
      // Fail fast (instead of hanging for minutes) when the DB is unreachable,
      // so the graceful fallbacks in pages render immediately.
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
  // Cache on globalThis so a warm serverless instance reuses its connection
  // pool across requests instead of reconnecting every time.
  if (!global.__pgClient) global.__pgClient = client;
  return drizzle(client, { schema });
}

/**
 * Proxy so `db.select().from(...)` works exactly like a real Drizzle instance
 * while deferring initialization until the first property access at runtime.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    if (!global.__drizzleDb) {
      global.__drizzleDb = createDb();
    }
    // @ts-expect-error dynamic proxy forwarding
    const value = global.__drizzleDb[prop];
    return typeof value === "function"
      ? value.bind(global.__drizzleDb)
      : value;
  },
});

export { schema };
