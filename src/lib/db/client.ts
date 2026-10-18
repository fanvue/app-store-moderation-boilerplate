import { Pool } from "pg";

/**
 * The moderation tool's own database: a real Postgres, served by PGlite over
 * the wire protocol so `npm run dev` and `npm run review` are separate
 * processes sharing one database, the way a web server and a job would be.
 *
 * `npm run dev` starts it on port 5544 with its files under `data/pg`, and
 * accepts eight connections at a time: enough for the web server, the job,
 * a migration and a `psql` session.
 * `npm run db` starts it on its own. `npm run db:reset` deletes it.
 * Migrations in `db/migrations/` are applied when the web server starts and
 * by `npm run db:migrate`.
 *
 * This is where the review store, decisions and anything else you persist
 * should live. The Fanvue API under `src/lib/fanvue/` is a different system
 * and stays an API.
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
