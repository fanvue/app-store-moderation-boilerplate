import { getApp, listApps, MAX_PAGE_SIZE } from "@/lib/fanvue/api";
import type { AppListing } from "@/lib/fanvue/types";

import { reviewListings } from "./rules";
import { createReviewStore } from "./store";

/**
 * Fetches every listing the slow way: each list page, then one detail call per
 * listing. Fine for a job; too slow for a page load.
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

/**
 * The job: crawl, review, store. `npm run review` runs it.
 *
 * `reviewListings` takes the whole set because 4.2 compares listings to each
 * other, so one edited listing can change another listing's findings.
 *
 * TODO: implement. The pieces are all imported.
 */
export async function runReviewJob(): Promise<void> {
  void reviewListings;
  void createReviewStore;
  throw new Error("runReviewJob is not implemented");
}
