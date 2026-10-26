import type { Generated } from "kysely";

/**
 * The tables in the moderation database, as Kysely sees them. Each key is a
 * table name and each value describes its columns. Add a table here when you
 * add a migration for it, and `getDb()` knows about it.
 *
 * `Generated<T>` marks a column the database fills in, so inserts can leave
 * it out. `JSONColumnType<T>`, also from `kysely`, is for a `jsonb` column:
 * insert `JSON.stringify(value)` and read it back as `T`.
 */
export interface Database {
  review_runs: ReviewRunsTable;
}

/** One row per run of the review job. The worked example. */
export interface ReviewRunsTable {
  id: Generated<number>;
  started_at: Generated<Date>;
  finished_at: Date | null;
  rule_revision: string;
  listing_count: number | null;
}
