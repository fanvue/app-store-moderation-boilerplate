import { getApp, listApps, MAX_PAGE_SIZE } from "@/lib/fanvue/api";
import type { AppListing } from "@/lib/fanvue/types";

/**
 * Fetches every listing from the API: each list page, then one detail call per
 * listing. Both pages do this on every load today, which is why they are slow.
 */
export async function fetchEveryListing(): Promise<AppListing[]> {
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
  return listings;
}
