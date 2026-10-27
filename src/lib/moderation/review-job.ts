import { getDb } from "@/lib/db/client";
import { getApp, listApps, LIVE_RATE_LIMIT_PER_MINUTE, MAX_PAGE_SIZE } from "@/lib/fanvue/api";
import type { AppListing, AppListingSummary } from "@/lib/fanvue/types";

import { readRuleRevision } from "./rule-revision";
import { reviewListings } from "./rules";
import { createReviewStore, isFullListing, type ReviewStore } from "./store";

/** Detail calls saved per write, so the listing page fills in during the run. */
const DETAIL_BATCH_SIZE = 50;

/**
 * Resolves when the next call may go out, spacing calls evenly so the job
 * stays inside the live API's limit. The mock does not enforce the limit; the
 * job keeps to it anyway, so a full run takes about ten minutes.
 */
function createThrottle(callsPerMinute: number): () => Promise<void> {
  const intervalMs = 60_000 / callsPerMinute;
  let nextAt = 0;
  return async () => {
    const waitMs = nextAt - Date.now();
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
    nextAt = Date.now() + intervalMs;
  };
}

/**
 * Fetches listings into the store, at the live rate limit.
 *
 * 1. The list pass saves every summary, so the queue shows new listings as not
 *    reviewed yet before any detail call.
 * 2. The detail pass fetches only listings never fetched before, unless `full`.
 *    The webhook keeps fetched listings fresh, so a run after the first takes
 *    seconds, not ten minutes. A full run catches anything a missed webhook left
 *    stale.
 */
async function fetchListings(store: ReviewStore, full: boolean): Promise<void> {
  const throttle = createThrottle(LIVE_RATE_LIMIT_PER_MINUTE);

  const summaries: AppListingSummary[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    await throttle();
    const result = await listApps({ page, size: MAX_PAGE_SIZE });
    await store.saveListings(result.data);
    summaries.push(...result.data);
    hasMore = result.pagination.hasMore;
    page += 1;
  }

  const fetched = new Set(
    (await store.getAll()).flatMap(({ listing }) => (isFullListing(listing) ? [listing.uuid] : [])),
  );
  const toFetch = full ? summaries : summaries.filter(({ uuid }) => !fetched.has(uuid));
  console.log(`list pass: ${summaries.length} listings, ${toFetch.length} to fetch`);

  let done = 0;
  let batch: AppListing[] = [];
  for (const summary of toFetch) {
    await throttle();
    const listing = await getApp(summary.uuid);
    if (listing) batch.push(listing);
    done += 1;
    if (batch.length === DETAIL_BATCH_SIZE) {
      await store.saveListings(batch);
      batch = [];
      console.log(`detail pass: ${done} of ${toFetch.length}`);
    }
  }
  await store.saveListings(batch);
}

/**
 * The job: fetch listings, then review every stored listing and save the
 * reviews. The rules run over the whole set at once because 4.2 compares
 * listings with each other.
 *
 * - `npm run review`: incremental. Fetches only listings never fetched before.
 * - `npm run review -- --full`: fetches every listing's detail again.
 * - `npm run review -- --rules-only`: no API calls. Re-runs the rules over what
 *   is stored, for a new rule or a new requirements revision.
 */
export async function runReviewJob({
  full = process.argv.includes("--full"),
  rulesOnly = process.argv.includes("--rules-only"),
} = {}): Promise<void> {
  const db = getDb();
  const store = createReviewStore(db);
  const ruleRevision = await readRuleRevision();

  const run = await db
    .insertInto("review_runs")
    .values({ rule_revision: ruleRevision })
    .returning("id")
    .executeTakeFirstOrThrow();
  const runId = Number(run.id);
  const mode = rulesOnly ? "rules only" : full ? "full" : "incremental";
  console.log(`run ${runId} (${mode}) under requirements revision ${ruleRevision}`);

  if (!rulesOnly) await fetchListings(store, full);

  const listings = (await store.getAll()).flatMap(({ listing }) => (isFullListing(listing) ? [listing] : []));
  await store.saveReviews(reviewListings(listings), ruleRevision, runId);

  await db
    .updateTable("review_runs")
    .set({ finished_at: new Date(), listing_count: listings.length })
    .where("id", "=", runId)
    .execute();
  console.log(`reviewed ${listings.length} listings`);
}

/**
 * Handles one new submission (the webhook): fetch the edited listing, re-run
 * the rules over every stored listing because 4.2 compares them with each
 * other, and save only the reviews that changed. The store moves any listing
 * whose worst severity changed to the end of submission order. Returns how
 * many reviews changed.
 */
export async function reviewSubmission(uuid: string): Promise<{ changed: number } | null> {
  const listing = await getApp(uuid);
  if (!listing) return null;

  const db = getDb();
  const store = createReviewStore(db);
  const ruleRevision = await readRuleRevision();
  await store.saveListings([listing]);

  const stored = await store.getAll();
  const before = new Map(stored.map(({ listing: { uuid: key }, review }) => [key, review]));
  const reviews = reviewListings(
    stored.flatMap(({ listing: candidate }) => (isFullListing(candidate) ? [candidate] : [])),
  );
  const changed = reviews.filter(({ listing: reviewed, issues }) => {
    const previous = before.get(reviewed.uuid);
    return (
      reviewed.uuid === uuid ||
      !previous ||
      previous.ruleRevision !== ruleRevision ||
      JSON.stringify(previous.issues) !== JSON.stringify(issues)
    );
  });

  const run = await db
    .insertInto("review_runs")
    .values({ rule_revision: ruleRevision })
    .returning("id")
    .executeTakeFirstOrThrow();
  await store.saveReviews(changed, ruleRevision, Number(run.id));
  await db
    .updateTable("review_runs")
    .set({ finished_at: new Date(), listing_count: changed.length })
    .where("id", "=", run.id)
    .execute();

  return { changed: changed.length };
}
