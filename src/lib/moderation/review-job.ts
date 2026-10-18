import { apiCallCount, getApp, listApps, MAX_PAGE_SIZE } from "@/lib/fanvue/api";
import type { AppListing } from "@/lib/fanvue/types";

import { reviewListings } from "./rules";
import { createReviewStore } from "./store";

/**
 * Fetches every listing the way a first attempt would: page through the list
 * endpoint, then one detail call per listing. 41 list calls and 2,015 detail
 * calls for today's queue.
 *
 * The boilerplate pages call this on every request so the cost is on screen
 * rather than hidden. Against the live API, at 200 calls a minute, this loop
 * takes about ten minutes, which is why it belongs in {@link runReviewJob}
 * and not in a page.
 */
export async function fetchEveryListing(): Promise<{ listings: AppListing[]; apiCalls: number; ms: number }> {
  const startedCalls = apiCallCount();
  const startedAt = performance.now();

  const listings: AppListing[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const result = await listApps({ page, size: MAX_PAGE_SIZE });
    for (const summary of result.data) {
      const listing = await getApp(summary.uuid);
      if (listing) listings.push(listing);
    }
    hasMore = result.pagination.hasMore;
    page += 1;
  }

  return { listings, apiCalls: apiCallCount() - startedCalls, ms: Math.round(performance.now() - startedAt) };
}

/**
 * The job: crawl, review, store. `npm run review` runs it from the command
 * line; whether anything else should trigger it (a webhook saying a listing
 * changed, a schedule, a button) is yours to decide.
 *
 * `reviewListings` takes the whole set because 4.2 compares listings to each
 * other, so one edited listing can change another listing's findings. Say in
 * `ASSUMPTIONS.md` what the job re-reviews when one listing changes.
 *
 * TODO: implement. The pieces are all imported.
 */
export async function runReviewJob(): Promise<void> {
  void reviewListings;
  void createReviewStore;
  throw new Error("runReviewJob is not implemented");
}
