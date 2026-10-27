import { getDb } from "@/lib/db/client";
import { getApp, listApps, LIVE_RATE_LIMIT_PER_MINUTE, MAX_PAGE_SIZE } from "@/lib/fanvue/api";
import type { AppListing, AppListingSummary } from "@/lib/fanvue/types";

import { readRuleRevision } from "./rule-revision";
import { reviewListings } from "./rules";
import { createReviewStore } from "./store";

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
 * The job: fetch every listing, review the whole set, store. `npm run review`
 * runs it.
 *
 * 1. The list pass saves every summary, so the queue shows each listing as not
 *    reviewed yet before any detail call.
 * 2. The detail pass saves full listings in batches.
 * 3. The rules run once over the full set, because 4.2 compares listings with
 *    each other, and the reviews are saved.
 */
export async function runReviewJob(): Promise<void> {
  const db = getDb();
  const store = createReviewStore(db);
  const throttle = createThrottle(LIVE_RATE_LIMIT_PER_MINUTE);
  const ruleRevision = await readRuleRevision();

  const run = await db
    .insertInto("review_runs")
    .values({ rule_revision: ruleRevision })
    .returning("id")
    .executeTakeFirstOrThrow();
  const runId = Number(run.id);
  console.log(
    `run ${runId} under requirements revision ${ruleRevision}, at ${LIVE_RATE_LIMIT_PER_MINUTE} calls a minute`,
  );

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
  console.log(`list pass: ${summaries.length} listings`);

  const listings: AppListing[] = [];
  let batch: AppListing[] = [];
  for (const summary of summaries) {
    await throttle();
    const listing = await getApp(summary.uuid);
    if (listing) batch.push(listing);
    if (batch.length === DETAIL_BATCH_SIZE) {
      await store.saveListings(batch);
      listings.push(...batch);
      batch = [];
      console.log(`detail pass: ${listings.length} of ${summaries.length}`);
    }
  }
  await store.saveListings(batch);
  listings.push(...batch);

  await store.saveReviews(reviewListings(listings), ruleRevision, runId);

  await db
    .updateTable("review_runs")
    .set({ finished_at: new Date(), listing_count: listings.length })
    .where("id", "=", runId)
    .execute();
  console.log(`reviewed ${listings.length} listings`);
}

/**
 * Fetches every listing the slow way, unthrottled. Only the pages still call
 * it, until they read from the store.
 */
export async function fetchEveryListing(): Promise<{ listings: AppListing[]; apiCalls: number; ms: number }> {
  const startedAt = performance.now();

  const listings: AppListing[] = [];
  let apiCalls = 0;
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const result = await listApps({ page, size: MAX_PAGE_SIZE });
    apiCalls += 1;
    for (const summary of result.data) {
      const listing = await getApp(summary.uuid);
      apiCalls += 1;
      if (listing) listings.push(listing);
    }
    hasMore = result.pagination.hasMore;
    page += 1;
  }

  return { listings, apiCalls, ms: Math.round(performance.now() - startedAt) };
}
