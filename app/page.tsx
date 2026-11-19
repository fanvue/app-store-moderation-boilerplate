import { ReviewQueue } from "@/components/ReviewQueue";
import { fetchEveryListing } from "@/lib/moderation/fetch-every-listing";
import { reviewListings } from "@/lib/moderation/rules";

// Rendered on every request, so the cost below is paid on every request.
export const dynamic = "force-dynamic";

/**
 * The queue, the slow way: fetch every listing, review them all and render
 * every row. `npm run measure` says what that costs.
 *
 * TODO (yours): read one page from `src/lib/moderation/store.ts`, with the
 * page number and size from `searchParams`.
 */
export default async function ReviewQueuePage() {
  const rows = reviewListings(await fetchEveryListing());

  return <ReviewQueue rows={rows} />;
}
