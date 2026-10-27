import Link from "next/link";

import { isFullListing, type QueuePage, type QueueSort } from "@/lib/moderation/store";

import { queueHref } from "./queueHref";
import { QueueTable, type QueueRow } from "./QueueTable";

/** When the job last finished, for the moderator to read. */
export function formatReviewedAt(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}

/**
 * The moderator's queue, one page of it: listings not reviewed yet first, then
 * the most serious, then submission order, unless the moderator picked a sort.
 * The order comes from the store (`getQueuePage`), across every page.
 */
export function ReviewQueue({ queue, sort }: { queue: QueuePage; sort?: QueueSort }) {
  const { rows, total, page, size, reviewedAt, ruleRevision } = queue;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const pageHref = (target: number) => queueHref({ page: target, size, sort });
  const tableRows: QueueRow[] = rows.map(({ listing, review }) => ({
    uuid: listing.uuid,
    name: listing.name,
    developerHandle: listing.developer.handle,
    pricingType: listing.pricingType,
    screenshotCount: isFullListing(listing) ? listing.previewImageUrls.length : null,
    review,
  }));

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Review queue</h1>
      <p>
        {total.toLocaleString()} listings.{" "}
        {reviewedAt
          ? `The review job last finished ${formatReviewedAt(reviewedAt)}, under requirements revision ${ruleRevision}.`
          : "The review job has not finished a run yet. Run npm run review."}
      </p>

      <QueueTable rows={tableRows} size={size} sort={sort} />

      <nav className="flex items-center gap-4 text-sm">
        {page > 1 ? (
          <Link href={pageHref(page - 1)} className="underline">
            Previous
          </Link>
        ) : (
          <span className="text-neutral-400">Previous</span>
        )}
        <span>
          Page {page} of {pageCount}
        </span>
        {page < pageCount ? (
          <Link href={pageHref(page + 1)} className="underline">
            Next
          </Link>
        ) : (
          <span className="text-neutral-400">Next</span>
        )}
      </nav>
    </section>
  );
}
