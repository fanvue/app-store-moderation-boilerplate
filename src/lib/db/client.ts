import { Pool } from "pg";

/**
 * The moderation tool's own Postgres, served by PGlite on port 5544.
 *
 * Keep the review store, decisions and anything else here. The Fanvue API
 * under `src/lib/fanvue/` is a different system and stays an API.
 */

export const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5544/postgres";

const globalForDb = globalThis as unknown as { moderationPool?: Pool };

/** One pool per process, kept across hot reloads in development. */
export function getDb(): Pool {
  if (!globalForDb.moderationPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
      // PGlite runs one statement at a time across connections. Keep transactions short.
      max: 2,
      ssl: false,
      // Fail fast when the database is not up, rather than hang.
      connectionTimeoutMillis: 2000,
    });
    // Unhandled, a lost idle connection would crash the process.
    pool.on("error", (error) => console.error(`database connection lost: ${error.message}`));
    globalForDb.moderationPool = pool;
  }
  return globalForDb.moderationPool;
}
