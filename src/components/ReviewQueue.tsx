import Link from "next/link";

import type { Review } from "@/lib/moderation/rules";

function findingsLabel(count: number): string {
  if (count === 0) return "No findings";
  return count === 1 ? "1 finding" : `${count} findings`;
}

/**
 * The moderator's queue. It renders every listing in submission order. Every
 * row here went through the rules, so a listing with no findings says "No
 * findings". Once reviews come from the store, some listings will not be
 * reviewed yet. Show those differently from listings that passed.
 *
 * TODO (yours): see the README's "What done looks like". Sorting across pages
 * comes from the store (`getQueuePage` in `src/lib/moderation/store.ts`), not
 * from sorting this page.
 */
export function ReviewQueue({ rows }: { rows: Review[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Review queue</h1>
      {/* TODO: once the queue is paged, rows.length is one page; the total comes from the store. */}
      <p>{rows.length} listings awaiting review. Open one to see the full listing.</p>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4">App</th>
            <th className="py-2 pr-4">Developer</th>
            <th className="py-2 pr-4">Pricing</th>
            <th className="py-2 pr-4">Screenshots</th>
            {/* TODO: status of the worst finding (`worstSeverity` in queue.ts), or Not reviewed yet / No findings */}
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
