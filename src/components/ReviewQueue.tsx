import { TableCard, TablePagination } from "@fanvue/ui";

import { isFullListing, type QueuePage, type QueueSort } from "@/lib/moderation/store";

import { QueuePagination } from "./QueuePagination";
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
  const first = total === 0 ? 0 : (page - 1) * size + 1;
  const last = Math.min(page * size, total);
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
      <h1 className="typography-header-heading-md">Review queue</h1>
      <p className="typography-body-small-14px-regular text-content-secondary">
        {total.toLocaleString()} listings.{" "}
        {reviewedAt
          ? `The review job last finished ${formatReviewedAt(reviewedAt)}, under requirements revision ${ruleRevision}.`
          : "The review job has not finished a run yet. Run npm run review."}
      </p>

      <TableCard size="condensed">
        <QueueTable rows={tableRows} size={size} sort={sort} />
        <TablePagination
          summary={`${first.toLocaleString()}–${last.toLocaleString()} of ${total.toLocaleString()}`}
          paginationSlot={<QueuePagination page={page} pageCount={pageCount} size={size} sort={sort} />}
        />
      </TableCard>
    </section>
  );
}
