import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getDb } from "./client";

/**
 * Applies the `.sql` files in `db/migrations/` that have not been applied
 * yet, in filename order, each in its own transaction. Names are recorded in
 * `schema_migrations`, so a file is applied once per database.
 *
 * Add a migration by adding a file: `0002_reviews.sql`, `0003_decisions.sql`.
 * Nothing rewrites an applied file, so change the schema with a new one.
 */

/**
 * The slice of a database client that migrations need. `pg` and PGlite both
 * have `query`. PGlite's `query` takes one statement at a time, so a file with
 * several goes through its `exec`; `pg` runs several in one `query`.
 */
export type Queryable = {
  query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
  exec?(text: string): Promise<unknown>;
};

export const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

export async function migrate(client: Queryable, dir = MIGRATIONS_DIR): Promise<string[]> {
  await client.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );

  const applied = new Set(
    ((await client.query("select name from schema_migrations")).rows as { name: string }[]).map((row) => row.name),
  );
  const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();

  const newlyApplied: string[] = [];
  for (const name of files) {
    if (applied.has(name)) continue;
    const sql = await readFile(path.join(dir, name), "utf8");
    await client.query("begin");
    try {
      await (client.exec ? client.exec(sql) : client.query(sql));
      await client.query("insert into schema_migrations (name) values ($1)", [name]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw new Error(`migration ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    newlyApplied.push(name);
  }
  return newlyApplied;
}

/**
 * Runs {@link migrate} against the pool, waiting for the database to come up
 * first because `npm run dev` starts Postgres and the web server together.
 */
export async function migrateWithRetry({ attempts = 60, delayMs = 500 } = {}): Promise<string[]> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const client = await getDb()
      .connect()
      .catch((error: unknown) => {
        lastError = error;
        return null;
      });
    if (client) {
      try {
        return await migrate(client);
      } finally {
        client.release();
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(
    `could not reach Postgres after ${attempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}
