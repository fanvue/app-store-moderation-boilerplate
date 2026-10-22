import { ReviewQueue } from "@/components/ReviewQueue";
import { LIVE_RATE_LIMIT_PER_MINUTE } from "@/lib/fanvue/api";
import { fetchEveryListing } from "@/lib/moderation/review-job";
import { reviewListings } from "@/lib/moderation/rules";

// Rendered on every request, so the cost below is paid on every request.
export const dynamic = "force-dynamic";

/**
 * The queue, the slow way: fetch, review and render everything. The footer
 * says what it cost.
 *
 * TODO (yours): read a page from `src/lib/moderation/store.ts`, with page,
 * size, severity and rule from `searchParams`. See the README's "What
 * done looks like".
 */
export default async function ReviewQueuePage() {
  const { listings, apiCalls, ms } = await fetchEveryListing();
  const rows = reviewListings(listings);

  return (
    <>
      <ReviewQueue rows={rows} />
      <p className="mt-6 text-xs text-neutral-500">
        This page made {apiCalls.toLocaleString()} API calls, spending {ms.toLocaleString()} ms on them before rendering
        anything, to review {rows.length.toLocaleString()} listings. The live API allows {LIVE_RATE_LIMIT_PER_MINUTE}{" "}
        calls a minute.
      </p>
    </>
  );
}
