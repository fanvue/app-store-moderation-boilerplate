import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/ListingDetail";
import { getApp } from "@/lib/fanvue/api";
import { validateListing } from "@/lib/moderation/rules";

export default async function ListingDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const listing = getApp(uuid);
  if (!listing) notFound();

  return <ListingDetail listing={listing} issues={validateListing(listing)} />;
}
