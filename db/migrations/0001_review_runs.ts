import { type Kysely, sql } from 'kysely'

// The worked example of a migration: one row per run of the review job.
//
// Migrations run in file name order, and a new file must sort after the ones
// already applied: `0002_reviews.ts`, then `0003_decisions.ts`. Applied files
// are never re-run, so a change to a table needs a new file. The matching
// types are in `db/schema.ts`.
//
// `npm run dev` loads this file with Node itself, so import only from
// `kysely`. `Kysely<unknown>` because the tables at this point are whatever
// earlier migrations made, not yet what `db/schema.ts` describes.

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('review_runs')
    .addColumn('id', 'bigserial', col => col.primaryKey())
    .addColumn('started_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('finished_at', 'timestamptz')
    .addColumn('rule_revision', 'text', col => col.notNull())
    .addColumn('listing_count', 'integer')
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('review_runs').execute()
}
