import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/ListingDetail";
import { getApp } from "@/lib/fanvue/api";
import { fetchEveryListing } from "@/lib/moderation/review-job";
import { reviewListings } from "@/lib/moderation/rules";

export const dynamic = "force-dynamic";

/**
 * One listing. Reviewed against the whole store on every request, because 4.2
 * compares listings to each other and nothing has stored the result yet.
 *
 * TODO (yours): read the stored review from `src/lib/moderation/store.ts`.
 */
export default async function ListingDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const listing = await getApp(uuid);
  if (!listing) notFound();

  const { listings } = await fetchEveryListing();
  const review = reviewListings(listings).find((candidate) => candidate.listing.uuid === listing.uuid);

  return <ListingDetail listing={listing} issues={review?.issues ?? []} />;
}
