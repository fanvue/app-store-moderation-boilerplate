import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/ListingDetail";
import { getAllApps, getApp } from "@/lib/fanvue/api";
import { reviewListings } from "@/lib/moderation/rules";

export default async function ListingDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const listing = getApp(uuid);
  if (!listing) notFound();

  // Reviewed against the whole store, because some rules compare listings to each other.
  const review = reviewListings(getAllApps()).find((candidate) => candidate.listing.uuid === listing.uuid);

  return <ListingDetail listing={listing} issues={review?.issues ?? []} />;
}
