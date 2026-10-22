/**
 * Runs one SQL statement against the moderation database and prints the rows.
 *
 *   npm run db:query -- "select * from review_runs"
 *
 * Needs the database up (`npm run dev` or `npm run db`).
 */
import { getDb } from "@/lib/db/client";

const sql = process.argv.slice(2).join(" ").trim();
if (!sql) {
  console.error('usage: npm run db:query -- "select * from review_runs"');
  process.exit(1);
}

getDb()
  .query(sql)
  .then((result) => {
    if (result.rows.length > 0) console.table(result.rows);
    else console.log(`${result.command} ${result.rowCount ?? 0}`);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => getDb().end());
