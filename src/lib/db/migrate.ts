import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { type Kysely, sql } from 'kysely'

import { getDb } from './client'
import { FileMigrationProvider, Migrator } from 'kysely/migration'

/**
 * Applies the migrations in `db/migrations/` that have not been applied yet,
 * in file name order. Kysely records each name in `kysely_migration`, so a
 * file is applied once per database.
 *
 * Add a migration by adding a file that exports `up` (and `down` if you want
 * to undo it): `0002_reviews.ts`, `0003_decisions.ts`. Nothing rewrites an
 * applied file, so change the schema with a new one.
 */

export const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations')

// Migrations run against whatever schema exists at the time, so any database type will do.
export async function migrate<Database>(db: Kysely<Database>, dir = MIGRATIONS_DIR): Promise<string[]> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      // Node 24 loads a `.ts` file directly. The comments keep the bundler
      // from trying to resolve the path at build time.
      import: file => import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pathToFileURL(file).href),
      migrationFolder: dir,
      path,
    }),
  })

  const { error, results } = await migrator.migrateToLatest()
  const outcomes = results ?? []
  if (error) {
    const failed = outcomes.find(result => result.status === 'Error')
    const cause = error instanceof Error ? error.message : String(error)
    throw new Error(failed ? `migration ${failed.migrationName} failed: ${cause}` : cause)
  }
  return outcomes.filter(result => result.status === 'Success').map(result => result.migrationName)
}

/** Thrown when the database never answered. A failing migration throws a plain Error naming the file. */
export class DatabaseUnreachableError extends Error {}

/**
 * Runs {@link migrate} against the app's database, waiting for it to come up
 * first because `npm run dev` starts Postgres and the web server together.
 */
export async function migrateWithRetry({ attempts = 60, delayMs = 500 } = {}): Promise<string[]> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const reachable = await sql`select 1`
      .execute(getDb())
      .then(() => true)
      .catch((error: unknown) => {
        lastError = error
        return false
      })
    if (reachable) {
      return migrate(getDb())
    }
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  throw new DatabaseUnreachableError(
    `could not reach Postgres after ${attempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  )
}
