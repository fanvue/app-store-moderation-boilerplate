import { PGlite } from "@electric-sql/pglite";
import { Kysely, PostgresDialect } from "kysely";
import type { Pool } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Database } from "@db/schema";
import { namedListings } from "@fixtures/listings";
import { migrate } from "@/lib/db/migrate";
import type { AppListing, AppListingSummary } from "@/lib/fanvue/types";

import type { Issue } from "./rules";
import { createReviewStore, type ReviewStore } from "./store";

/** Kysely over an in-memory PGlite, as in `src/lib/db/migrate.test.ts`. */
function kyselyOver(pglite: PGlite): Kysely<Database> {
  const client = {
    query: async (text: string, params: unknown[]) => {
      const result = await pglite.query(text, params);
      return { rows: result.rows, rowCount: result.affectedRows ?? 0 };
    },
    release() {},
  };
  const pool = { connect: async () => client, end: async () => {} };
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool: pool as unknown as Pool }) });
}

const issue = (severity: Issue["severity"]): Issue => ({
  code: `test_${severity}`,
  rule: "2.3",
  severity,
  message: `a ${severity} finding`,
  field: "previewImageUrls",
  matched: "https://example.com/one.png, https://example.com/one.png",
});

const [first, second, third, fourth] = namedListings as [AppListing, AppListing, AppListing, AppListing];

describe("review store", () => {
  let pglite: PGlite;
  let db: Kysely<Database>;
  let store: ReviewStore;
  let runId: number;

  beforeEach(async () => {
    pglite = new PGlite();
    db = kyselyOver(pglite);
    await migrate(db);
    store = createReviewStore(db);
    const run = await db
      .insertInto("review_runs")
      .values({ rule_revision: "3" })
      .returning("id")
      .executeTakeFirstOrThrow();
    runId = Number(run.id);
  });

  afterEach(async () => {
    await pglite.close();
  });

  const names = async () => (await store.getQueuePage({ page: 1, size: 10 })).rows.map((row) => row.listing.name);

  it("puts unreviewed listings first, then the most serious, keeping submission order within a severity", async () => {
    await store.saveListings([first, second, third, fourth]);
    await store.saveReviews(
      [
        { listing: first, issues: [] },
        { listing: second, issues: [issue("fix")] },
        { listing: fourth, issues: [issue("warn"), issue("reject")] },
      ],
      "3",
      runId,
    );
    await db.updateTable("review_runs").set({ finished_at: new Date() }).execute();

    const page = await store.getQueuePage({ page: 1, size: 2 });

    expect(page.rows.map((row) => [row.listing.name, row.review?.issues.length ?? null])).toEqual([
      [third.name, null],
      [fourth.name, 2],
    ]);
    expect(page.total).toBe(4);
    expect(page.ruleRevision).toBe("3");
    expect(page.reviewedAt).not.toBeNull();
    expect((await store.getQueuePage({ page: 2, size: 2 })).rows.map((row) => row.listing.name)).toEqual([
      second.name,
      first.name,
    ]);
  });

  it("filters by worst severity and counts every severity across the whole store", async () => {
    await store.saveListings([first, second, third, fourth]);
    await store.saveReviews(
      [
        { listing: first, issues: [] },
        { listing: second, issues: [issue("fix")] },
        { listing: fourth, issues: [issue("warn"), issue("reject")] },
      ],
      "3",
      runId,
    );

    const rejects = await store.getQueuePage({ page: 1, size: 10, severity: "reject" });
    const clear = await store.getQueuePage({ page: 1, size: 10, severity: "none" });

    expect(rejects.rows.map((row) => row.listing.name)).toEqual([fourth.name]);
    expect(rejects.total).toBe(1);
    expect(clear.rows.map((row) => row.listing.name)).toEqual([first.name]);
    expect(rejects.counts).toEqual({ all: 4, reject: 1, fix: 1, warn: 0, none: 1 });
  });

  it("searches app name and developer handle ignoring case, and counts only the matches", async () => {
    await store.saveListings([first, second, third, fourth]);
    await store.saveReviews([{ listing: second, issues: [issue("fix")] }], "3", runId);

    const byName = await store.getQueuePage({ page: 1, size: 10, q: second.name.slice(1, 5).toUpperCase() });
    const byHandle = await store.getQueuePage({ page: 1, size: 10, q: `@${third.developer.handle}`.slice(1) });

    expect(byName.rows.map((row) => row.listing.name)).toContain(second.name);
    expect(byName.counts.fix).toBe(1);
    expect(byName.total).toBe(byName.rows.length);
    expect(byHandle.rows.map((row) => row.listing.name)).toContain(third.name);
    expect((await store.getQueuePage({ page: 1, size: 10, q: "%" })).total).toBe(0);
  });

  it("moves a listing to the end of submission order only when its worst severity changes", async () => {
    await store.saveListings([first, second, third]);
    await store.saveReviews(
      [first, second, third].map((listing) => ({ listing, issues: [issue("fix")] })),
      "3",
      runId,
    );
    expect(await names()).toEqual([first.name, second.name, third.name]);

    await store.saveReviews(
      [
        { listing: first, issues: [issue("fix"), issue("fix")] },
        { listing: second, issues: [issue("reject")] },
        { listing: third, issues: [issue("fix")] },
      ],
      "3",
      runId,
    );
    expect(await names()).toEqual([second.name, first.name, third.name]);

    await store.saveReviews([{ listing: second, issues: [issue("fix")] }], "3", runId);
    expect(await names()).toEqual([first.name, third.name, second.name]);
  });

  it("returns a stored listing as it was saved, and a summary without a review until the job reaches it", async () => {
    const { uuid, name, tagline, description, logoUrl, appUrl, pricingType, rating, developer } = first;
    const summary: AppListingSummary = {
      uuid,
      name,
      tagline,
      description,
      logoUrl,
      appUrl,
      pricingType,
      rating,
      developer,
    };

    await store.saveListings([summary]);
    expect(await store.getReview(first.uuid)).toEqual({ listing: summary, review: null });

    await store.saveListings([first]);
    await store.saveReviews([{ listing: first, issues: [issue("fix")] }], "3", runId);
    // A later summary must not wipe the detail columns.
    await store.saveListings([summary]);

    const stored = await store.getReview(first.uuid);
    expect(stored?.listing).toEqual({ ...first, ratingDistribution: null });
    expect(stored?.review?.issues).toEqual([issue("fix")]);
    expect(stored?.review?.ruleRevision).toBe("3");
    expect(await store.getReview("00000000-0000-4000-8000-000000000000")).toBeNull();
  });
});
