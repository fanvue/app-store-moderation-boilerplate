import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { migrate } from "./migrate";

/**
 * Runs the real migrations against an in-memory PGlite, which is the same
 * Postgres `npm run dev` serves over a socket. If this is green, the files in
 * `db/migrations/` apply cleanly from nothing.
 */

/** Kysely over an in-memory PGlite, with the small slice of `pg.Pool` its driver uses. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function kyselyOver(pglite: PGlite): Kysely<any> {
  const client = {
    query: async (text: string, params: unknown[]) => {
      const result = await pglite.query(text, params);
      return { rows: result.rows, rowCount: result.affectedRows ?? 0 };
    },
    release() {},
  };
  const pool = { connect: async () => client, end: async () => {} };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Kysely<any>({ dialect: new PostgresDialect({ pool: pool as unknown as Pool }) });
}

describe("migrate", () => {
  let pglite: PGlite;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: Kysely<any>;

  beforeAll(async () => {
    pglite = new PGlite();
    await pglite.waitReady;
    db = kyselyOver(pglite);
  });

  afterAll(async () => {
    await pglite.close();
  });

  it("applies every migration once, in order, and records it", async () => {
    const first = await migrate(db);
    const second = await migrate(db);

    expect(first.length).toBeGreaterThan(0);
    expect(first).toEqual([...first].sort());
    expect(second).toEqual([]);

    const recorded = await sql<{ name: string }>`select name from kysely_migration order by name`.execute(db);
    expect(recorded.rows.map((row) => row.name)).toEqual(first);
  });

  it("leaves the worked-example table in place", async () => {
    const { rows } = await sql<{ count: number }>`select count(*)::int as count from review_runs`.execute(db);
    expect(rows).toEqual([{ count: 0 }]);
  });

  it("applies a file with more than one statement", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "migrations-"));
    const scratch = new PGlite();
    try {
      await writeFile(
        path.join(dir, "0001_two.ts"),
        [
          'import { sql } from "kysely";',
          "export async function up(db) {",
          "  await sql`create table t (id int)`.execute(db);",
          "  await sql`create index t_id on t (id)`.execute(db);",
          "}",
          "export async function down() {}",
          "",
        ].join("\n"),
      );
      expect(await migrate(kyselyOver(scratch), dir)).toEqual(["0001_two"]);
    } finally {
      await scratch.close();
      await rm(dir, { recursive: true, force: true });
    }
  });
});
