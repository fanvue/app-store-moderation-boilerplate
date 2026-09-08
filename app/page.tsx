import { ReviewQueue } from "@/components/ReviewQueue";
import { getAllApps } from "@/lib/fanvue/api";
import { validateListing } from "@/lib/moderation/rules";

export default function ReviewQueuePage() {
  const rows = getAllApps().map((listing) => ({ listing, issues: validateListing(listing) }));
  return <ReviewQueue rows={rows} />;
}
