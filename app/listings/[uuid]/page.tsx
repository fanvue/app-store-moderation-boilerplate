import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/ListingDetail";
import { fetchEveryListing } from "@/lib/moderation/fetch-every-listing";
import { reviewListings } from "@/lib/moderation/rules";

export const dynamic = "force-dynamic";

/**
 * One listing, the slow way: fetch every listing and review them all to show
 * one, because 4.2 compares it with the rest.
 *
 * TODO (yours): read the stored review from `src/lib/moderation/store.ts`.
 */
export default async function ListingDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;

  const review = reviewListings(await fetchEveryListing()).find(
    (candidate) => candidate.listing.uuid.toLowerCase() === uuid.toLowerCase(),
  );
  if (!review) notFound();

  return <ListingDetail listing={review.listing} issues={review.issues} />;
}
