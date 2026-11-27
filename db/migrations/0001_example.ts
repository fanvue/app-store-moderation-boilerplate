/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is the worked example of a migration. Add your own tables in a new file next to it.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

import { type Kysely, sql } from "kysely";

// The worked example of a migration: one table that nothing uses. Copy its
// shape for your own tables.
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
    .createTable("example")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("note", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("example").execute();
}
