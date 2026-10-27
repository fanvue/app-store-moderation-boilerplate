import Link from "next/link";

import { worstSeverity } from "@/lib/moderation/queue";
import type { Severity } from "@/lib/moderation/rules";
import { isFullListing, type QueuePage, type StoredListing } from "@/lib/moderation/store";

const SEVERITY_CLASS: Record<Severity, string> = {
  reject: "font-semibold text-red-700",
  fix: "font-semibold text-amber-700",
  warn: "text-sky-700",
};

/** When the job last finished, for the moderator to read. */
export function formatReviewedAt(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}

function Status({ review }: Pick<StoredListing, "review">) {
  if (!review) return <span className="text-neutral-500 italic">Not reviewed yet</span>;

  const worst = worstSeverity(review.issues);
  if (!worst) return <span className="text-green-700">No findings</span>;

  const count = review.issues.length;
  return (
    <span>
      <span className={SEVERITY_CLASS[worst]}>{worst}</span>{" "}
      <span className="text-neutral-500">
        ({count === 1 ? "1 finding" : `${count} findings`}, rule{" "}
        {[...new Set(review.issues.map((issue) => issue.rule))].join(", ")})
      </span>
    </span>
  );
}

/**
 * The moderator's queue, one page of it: listings not reviewed yet first, then
 * the most serious, then submission order. The order comes from the store
 * (`getQueuePage`), across every page.
 */
export function ReviewQueue({ queue }: { queue: QueuePage }) {
  const { rows, total, page, size, reviewedAt, ruleRevision } = queue;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const pageHref = (target: number) => `/?page=${target}&size=${size}`;

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Review queue</h1>
      <p>
        {total.toLocaleString()} listings.{" "}
        {reviewedAt
          ? `The review job last finished ${formatReviewedAt(reviewedAt)}, under requirements revision ${ruleRevision}.`
          : "The review job has not finished a run yet. Run npm run review."}
      </p>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4">App</th>
            <th className="py-2 pr-4">Developer</th>
            <th className="py-2 pr-4">Pricing</th>
            <th className="py-2 pr-4">Screenshots</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ listing, review }) => (
            <tr key={listing.uuid} className="border-b">
              <td className="py-2 pr-4">
                <Link href={`/listings/${listing.uuid}`} className="underline">
                  {listing.name}
                </Link>
              </td>
              <td className="py-2 pr-4">{listing.developer.handle ? `@${listing.developer.handle}` : "-"}</td>
              <td className="py-2 pr-4">{listing.pricingType}</td>
              <td className="py-2 pr-4">{isFullListing(listing) ? listing.previewImageUrls.length : "-"}</td>
              <td className="py-2 pr-4">
                <Status review={review} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
