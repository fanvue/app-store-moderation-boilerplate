/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is plumbing behind one of the npm commands.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

/**
 * Applies pending migrations to the running database.
 *
 *   npm run db:migrate
 *
 * `npm run dev` does this on startup too. Use this when you add a migration
 * while the server is up, or want to migrate from a job.
 */
import { getDb } from "@/lib/db/client";
import { migrateWithRetry } from "@/lib/db/migrate";

migrateWithRetry({ attempts: 3 })
  .then((applied) => {
    console.log(applied.length ? `applied: ${applied.join(", ")}` : "nothing to apply");
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => getDb().destroy());
