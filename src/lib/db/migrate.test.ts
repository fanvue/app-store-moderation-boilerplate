import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { migrate } from "./migrate";

/**
 * Runs the real migrations against an in-memory PGlite, which is the same
 * Postgres `npm run dev` serves over a socket. If this is green, the files in
 * `db/migrations/` apply cleanly from nothing.
 */
describe("migrate", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    await db.waitReady;
  });

  afterAll(async () => {
    await db.close();
  });

  it("applies every migration once, in order, and records it", async () => {
    const first = await migrate(db);
    const second = await migrate(db);

    expect(first.length).toBeGreaterThan(0);
    expect(first).toEqual([...first].sort());
    expect(second).toEqual([]);

    const recorded = (await db.query("select name from schema_migrations order by name")).rows as { name: string }[];
    expect(recorded.map((row) => row.name)).toEqual(first);
  });

  it("leaves the worked-example table in place", async () => {
    const { rows } = await db.query("select count(*)::int as count from review_runs");
    expect(rows).toEqual([{ count: 0 }]);
  });

  it("applies a file with more than one statement", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "migrations-"));
    const scratch = new PGlite();
    try {
      await writeFile(path.join(dir, "0001_two.sql"), "create table t (id int);\ncreate index t_id on t (id);\n");
      expect(await migrate(scratch, dir)).toEqual(["0001_two.sql"]);
    } finally {
      await scratch.close();
      await rm(dir, { recursive: true, force: true });
    }
  });
});
