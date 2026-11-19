import Link from "next/link";

import type { Review } from "@/lib/moderation/rules";

function findingsLabel(count: number): string {
  if (count === 0) return "No findings";
  return count === 1 ? "1 finding" : `${count} findings`;
}

/**
 * The moderator's queue. Today it renders every listing in submission order.
 *
 * TODO (yours): render one page of rows from `getQueuePage` in
 * `src/lib/moderation/store.ts`. See the README's "Acceptance criteria".
 */
export function ReviewQueue({ rows }: { rows: Review[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Review queue</h1>
      {/* TODO: once the queue is paged, rows.length is one page. The total comes from the store. */}
      <p>{rows.length} listings awaiting review. Open one to see the full listing.</p>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4">App</th>
            <th className="py-2 pr-4">Developer</th>
            <th className="py-2 pr-4">Pricing</th>
            <th className="py-2 pr-4">Screenshots</th>
            {/* TODO: the most serious finding (`worstSeverity` in queue.ts), or No findings */}
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
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
              <td className="py-2 pr-4">{findingsLabel(issues.length)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
