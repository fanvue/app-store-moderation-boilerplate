import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/ListingDetail";
import { listDecisions } from "@/lib/moderation/decisions";
import { createReviewStore } from "@/lib/moderation/store";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One listing, its stored review and its latest moderator decision. No API calls. */
export default async function ListingDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;

  const stored = UUID_PATTERN.test(uuid) ? await createReviewStore().getReview(uuid) : null;
  if (!stored) notFound();

  // Newest first, so the first match is the latest decision.
  const decision = (await listDecisions()).find((entry) => entry.listingUuid === uuid) ?? null;

  return <ListingDetail stored={stored} decision={decision} />;
}
