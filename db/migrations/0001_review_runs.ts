import { type Kysely, sql } from "kysely";

// The worked example of a migration: one row per run of the review job.
//
// Migrations run in file name order. Applied files are never re-run, so a
// change to a table needs a new file. The matching types are in `db/schema.ts`.

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("review_runs")
    .addColumn("id", "bigserial", (col) => col.primaryKey())
    .addColumn("started_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("finished_at", "timestamptz")
    .addColumn("rule_revision", "text", (col) => col.notNull())
    .addColumn("listing_count", "integer")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("review_runs").execute();
}
