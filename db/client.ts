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
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file (see .env.example)."
    );
  }
  const client =
    global.__pgClient ??
    postgres(connectionString, {
      max: process.env.NODE_ENV === "production" ? 1 : 10,
      prepare: false, // safer on pooled connections (pgbouncer, Neon, etc.)
    });
  if (process.env.NODE_ENV !== "production") global.__pgClient = client;
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
