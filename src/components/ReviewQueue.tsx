import { TablePagination } from "@fanvue/ui";

import { isFullListing, type QueuePage } from "@/lib/moderation/store";

import type { QueueView } from "./queueHref";
import { QueuePagination } from "./QueuePagination";
import { QueueSearch } from "./QueueSearch";
import { QueueTable, type QueueRow } from "./QueueTable";
import { SeverityTiles } from "./SeverityTiles";

/** When the job last finished, for the moderator to read. */
export function formatReviewedAt(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}

/**
 * The moderator's queue, one page of it: listings not reviewed yet first, then
 * the most serious, then submission order, unless the moderator picked a sort.
 * The order comes from the store (`getQueuePage`), across every page.
 */
export function ReviewQueue({ queue, view }: { queue: QueuePage; view: QueueView }) {
  const { rows, total, counts, page, size, reviewedAt, ruleRevision } = queue;
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
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[32px] leading-10 font-bold tracking-[-0.02em]">Review queue</h1>
        <p className="typography-body-small-14px-regular text-content-secondary">
          {counts.all.toLocaleString("en-GB")} {counts.all === 1 ? "listing" : "listings"} ·{" "}
          {reviewedAt
            ? `last run finished ${formatReviewedAt(reviewedAt)} under requirements revision ${ruleRevision}`
            : "the review job has not finished a run yet. Run npm run review."}
        </p>
      </div>

      <SeverityTiles counts={counts} view={view} />

      <section
        aria-label="Listings"
        className="overflow-hidden rounded-[24px] border border-border-primary bg-background-primary"
      >
        <div className="border-b border-border-primary px-5 py-4">
          <QueueSearch view={view} />
        </div>
        <QueueTable rows={tableRows} view={view} />
        <TablePagination
          className="px-5 py-3.5"
          leadingSlot={
            <span className="text-[13px] text-content-secondary">
              {first.toLocaleString("en-GB")}–{last.toLocaleString("en-GB")} of {total.toLocaleString("en-GB")}
            </span>
          }
          paginationSlot={
            <QueuePagination page={page} pageCount={pageCount} view={view} />
          }
          summary={<span className="text-[13px] text-content-secondary">{size} per page</span>}
        />
      </section>
    </section>
  );
}
