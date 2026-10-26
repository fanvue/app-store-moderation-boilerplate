/**
 * Runs one SQL statement against the moderation database and prints the rows.
 *
 *   npm run db:query -- "select * from review_runs"
 *
 * Needs the database up (`npm run dev` or `npm run db`).
 */
import { sql } from "kysely";

import { getDb } from "@/lib/db/client";

const statement = process.argv.slice(2).join(" ").trim();
if (!statement) {
  console.error('usage: npm run db:query -- "select * from review_runs"');
  process.exit(1);
}

sql
  .raw<Record<string, unknown>>(statement)
  .execute(getDb())
  .then((result) => {
    if (result.rows.length > 0) console.table(result.rows);
    else console.log(`ok, ${result.numAffectedRows ?? 0} rows affected`);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => getDb().destroy());
