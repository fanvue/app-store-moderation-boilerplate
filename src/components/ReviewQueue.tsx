import Link from "next/link";

import type { AppListing } from "@/lib/fanvue/types";
import type { Issue } from "@/lib/moderation/rules";

export type ReviewQueueRow = {
  listing: AppListing;
  issues: Issue[];
};

/**
 * The moderator's queue. Deliberately bare: this screen is the product you build.
 * `ReviewQueue.acceptance.test.tsx` says what it must show; `src/lib/moderation/queue.ts` has the helpers to fill in.
 *
 * TODO (yours):
 * - Status per app. Today every row says "Not checked" because `validateListing`
 *   returns nothing. Once rules exist, a clean listing also returns `[]`, so
 *   decide how to tell "No findings" apart from "Not checked".
 * - Order. Worst first: reject, then fix, then warn, then clean.
 * - Whatever else a moderator needs to clear the queue quickly: counts by
 *   severity, which rule fired, a filter by status.
 *
 * Plain HTML is fine. `@fanvue/ui` is installed if you want it.
 */
export function ReviewQueue({ rows }: { rows: ReviewQueueRow[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Review queue</h1>
      <p>{rows.length} listings. Open one to see the full listing.</p>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4">App</th>
            <th className="py-2 pr-4">Developer</th>
            <th className="py-2 pr-4">Pricing</th>
            <th className="py-2 pr-4">Screenshots</th>
            {/* TODO: status of the worst finding, or Not checked / No findings */}
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: sort rows before rendering */}
          {rows.map(({ listing, issues }) => (
            <tr key={listing.uuid} className="border-b">
              <td className="py-2 pr-4">
                <Link href={`/listings/${listing.uuid}`} className="underline">
                  {listing.name}
                </Link>
              </td>
              <td className="py-2 pr-4">{listing.developer.handle ? `@${listing.developer.handle}` : "-"}</td>
              <td className="py-2 pr-4">{listing.pricingType}</td>
              <td className="py-2 pr-4">{listing.previewImageUrls.length}</td>
              {/* TODO: replace with a real status */}
              <td className="py-2 pr-4">{issues.length === 0 ? "Not checked" : `${issues.length} findings`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
