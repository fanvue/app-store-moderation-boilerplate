import { ReviewQueue } from "@/components/ReviewQueue";
import { LIVE_RATE_LIMIT_PER_MINUTE } from "@/lib/fanvue/api";
import { fetchEveryListing } from "@/lib/moderation/review-job";
import { reviewListings } from "@/lib/moderation/rules";

// Rendered on every request, so the cost below is paid on every request.
export const dynamic = "force-dynamic";

/**
 * The queue, the way a first attempt would build it: fetch everything, review
 * everything, render everything. It works. The footer says what it cost.
 *
 * TODO (yours): read a page of reviews from `src/lib/moderation/store.ts`
 * instead, with page, size, severity and rule taken from `searchParams`, so a
 * moderator's page load makes no API calls and "only the rejects, worst first"
 * is a link they can send to someone.
 */
export default async function ReviewQueuePage() {
  const { listings, apiCalls, ms } = await fetchEveryListing();
  const rows = reviewListings(listings);

  return (
    <>
      <ReviewQueue rows={rows} />
      <p className="mt-6 text-xs text-neutral-500">
        This page made {apiCalls.toLocaleString()} API calls in {ms.toLocaleString()} ms to review{" "}
        {rows.length.toLocaleString()} listings. The live API allows {LIVE_RATE_LIMIT_PER_MINUTE} calls a minute.
      </p>
    </>
  );
}
