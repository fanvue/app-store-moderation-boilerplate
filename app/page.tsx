import { ReviewQueue } from "@/components/ReviewQueue";
import { getAllApps } from "@/lib/fanvue/api";
import { reviewListings } from "@/lib/moderation/rules";

export default function ReviewQueuePage() {
  const rows = reviewListings(getAllApps());
  return <ReviewQueue rows={rows} />;
}
