import { Pool } from "pg";

/**
 * The moderation tool's own Postgres, served by PGlite on port 5544. The web
 * server and the job are separate processes sharing it. It accepts eight
 * connections at a time: the web server, the job, a migration and a `psql`
 * session.
 *
 * Persist the review store, decisions and anything else here. The Fanvue API
 * under `src/lib/fanvue/` is a different system and stays an API.
 */

export const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5544/postgres";

const globalForDb = globalThis as unknown as { moderationPool?: Pool };

/** One pool per process, kept across hot reloads in development. */
export function getDb(): Pool {
  if (!globalForDb.moderationPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
      // PGlite is one backend behind the socket: statements from every
      // connection run one at a time, and while one connection has a
      // transaction open the others wait for it. Keep transactions short.
      max: 2,
      ssl: false,
      // Fail fast when the database is not up yet, so startup retries and
      // `npm run review` without `npm run dev` give an error, not a hang.
      connectionTimeoutMillis: 2000,
    });
    // An idle client whose server went away emits here. Unhandled, it would
    // take the whole process down; the next query reports it instead.
    pool.on("error", (error) => console.error(`database connection lost: ${error.message}`));
    globalForDb.moderationPool = pool;
  }
  return globalForDb.moderationPool;
}
