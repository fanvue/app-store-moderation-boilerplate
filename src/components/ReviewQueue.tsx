import Link from "next/link";

import type { Review } from "@/lib/moderation/rules";

/**
 * The moderator's queue, and the product you are building. Deliberately bare:
 * it renders every listing in submission order and calls anything with no
 * findings "Not checked".
 *
 * TODO (yours):
 * - Status per app. A listing with no findings today is one nothing has
 *   checked; once your rules run it might also be one that passed everything.
 *   Decide how a moderator tells those apart.
 * - Order. Worst first — `src/lib/moderation/queue.ts` has the stubs.
 * - Whatever else someone clearing a backlog of two thousand needs: counts by
 *   severity, which rule fired, filters, and a table this long that still
 *   feels quick.
 *
 * Plain HTML is fine. `@fanvue/ui` is installed if you want it.
 */
export function ReviewQueue({ rows }: { rows: Review[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Review queue</h1>
      <p>{rows.length} listings awaiting review. Open one to see the full listing.</p>

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
