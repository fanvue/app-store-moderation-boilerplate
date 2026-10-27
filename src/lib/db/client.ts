import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

import type { Database } from '@db/schema'

/**
 * The moderation tool's own Postgres, served by PGlite on port 5544, through
 * [Kysely](https://kysely.dev). The tables it knows about are in `db/schema.ts`.
 *
 * Keep the review store, decisions and anything else here. The Fanvue API
 * under `src/lib/fanvue/` is a different system and stays an API.
 */

export const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5544/postgres'

const globalForDb = globalThis as unknown as { moderationDb?: Kysely<Database> }

/** One database per process, kept across hot reloads in development. */
export function getDb(): Kysely<Database> {
  if (!globalForDb.moderationDb) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
      // Fail fast when the database is not up, rather than hang.
      connectionTimeoutMillis: 2000,
      // PGlite runs one statement at a time across connections. Keep transactions short.
      max: 2,
      ssl: false,
    })
    // Unhandled, a lost idle connection would crash the process.
    pool.on('error', error => console.error(`database connection lost: ${error.message}`))
    globalForDb.moderationDb = new Kysely<Database>({ dialect: new PostgresDialect({ pool }) })
  }
  return globalForDb.moderationDb
}
