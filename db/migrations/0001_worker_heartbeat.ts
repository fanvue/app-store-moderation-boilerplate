import { type Kysely, sql } from "kysely";

// The worked example of a migration: one row that says when the worker last
// finished a step. The loop in `scripts/worker.ts` writes it.
//
// Migrations run in file name order, and a new file must sort after the ones
// already applied: `0002_something.ts`, then `0003_something_else.ts`. Applied
// files are never re-run, so a change to a table needs a new file. The
// matching types are in `db/schema.ts`.
//
// `npm run dev` loads this file with Node itself, so import only from
// `kysely`. `Kysely<unknown>` because the tables at this point are whatever
// earlier migrations made, not yet what `db/schema.ts` describes.

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("worker_heartbeat")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("beat_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("last_error", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("worker_heartbeat").execute();
}
