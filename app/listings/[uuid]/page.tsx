import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/ListingDetail";
import { LIVE_RATE_LIMIT_PER_MINUTE } from "@/lib/fanvue/api";
import { fetchEveryListing } from "@/lib/moderation/review-job";
import { reviewListings } from "@/lib/moderation/rules";

export const dynamic = "force-dynamic";

/**
 * One listing. Reviewed against the whole store on every request, because 4.2
 * compares listings to each other and nothing has stored the result yet. The
 * footer says what that cost, as on the queue.
 *
 * TODO (yours): read the stored review from `src/lib/moderation/store.ts`.
 */
export default async function ListingDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;

  const { listings, apiCalls, ms } = await fetchEveryListing();
  const review = reviewListings(listings).find((candidate) => candidate.listing.uuid.toLowerCase() === uuid.toLowerCase());
  if (!review) notFound();

  return (
    <>
      <ListingDetail listing={review.listing} issues={review.issues} />
      <p className="mt-6 text-xs text-neutral-500">
        This page made {apiCalls.toLocaleString()} API calls in {ms.toLocaleString()} ms to review one listing. The live
        API allows {LIVE_RATE_LIMIT_PER_MINUTE} calls a minute.
      </p>
    </>
  );
}
