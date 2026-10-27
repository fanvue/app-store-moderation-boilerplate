import Link from "next/link";

import { isFullListing, type StoredListing } from "@/lib/moderation/store";

import { FindingsList } from "./FindingsList";

/**
 * One stored listing: its findings first, then the fields the rules work with.
 * Until the job has made the listing's detail call, only the summary fields
 * are stored.
 */
export function ListingDetail({ stored }: { stored: StoredListing }) {
  const { listing, review } = stored;
  const full = isFullListing(listing) ? listing : null;

  return (
    <article className="flex flex-col gap-6 text-sm">
      <Link href="/" className="underline">
        Back to queue
      </Link>

      <header className="flex items-start gap-4">
        <img src={listing.logoUrl} alt="" width={64} height={64} />
        <div>
          <h1 className="text-2xl font-semibold">{listing.name}</h1>
          <p>{listing.tagline}</p>
          <p>
            {listing.developer.name ?? "Unknown developer"}
            {listing.developer.handle ? ` (@${listing.developer.handle})` : ""} · {listing.pricingType} · rating{" "}
            {listing.rating.average ?? "-"} ({listing.rating.count ?? 0})
          </p>
        </div>
      </header>

      <section>
        <h2 className="font-semibold">Findings</h2>
        <FindingsList review={review} />
      </section>

      <section>
        <h2 className="font-semibold">Copy</h2>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
          <Field label="description" value={listing.description} />
          {full ? (
            <>
              <Field label="descriptionTitle" value={full.descriptionTitle} />
              <Field label="descriptionBody" value={full.descriptionBody} />
              <Field label="highlights" value={full.highlights.length ? full.highlights.join(" | ") : "(none)"} />
            </>
          ) : null}
        </dl>
      </section>

      <section>
        <h2 className="font-semibold">Integration</h2>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
          <Field label="appUrl" value={listing.appUrl ?? "(null)"} />
          <Field label="uuid" value={listing.uuid} />
          <Field label="logoUrl" value={listing.logoUrl} />
        </dl>
      </section>

      {full ? (
        <>
          <section>
            <h2 className="font-semibold">Images</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
              <Field label="heroImageUrl" value={full.heroImageUrl} />
              <Field
                label="previewImageUrls"
                value={`${full.previewImageUrls.length}: ${full.previewImageUrls.join(" ")}`}
              />
              <Field
                label="galleryImageUrls"
                value={`${full.galleryImageUrls.length}: ${full.galleryImageUrls.join(" ")}`}
              />
            </dl>
          </section>

          <section>
            <h2 className="font-semibold">Pricing plans</h2>
            {full.pricingPlans.length === 0 ? (
              <p>(no plans)</p>
            ) : (
              <table className="border-collapse text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-1 pr-4">name</th>
                    <th className="py-1 pr-4">description</th>
                    <th className="py-1 pr-4">billingType</th>
                    <th className="py-1 pr-4">interval</th>
                    <th className="py-1 pr-4">price</th>
                    <th className="py-1 pr-4">currency</th>
                    <th className="py-1 pr-4">status</th>
                    <th className="py-1 pr-4">highlights</th>
                  </tr>
                </thead>
                <tbody>
                  {full.pricingPlans.map((plan) => (
                    <tr key={plan.uuid} className="border-b">
                      <td className="py-1 pr-4">{plan.name}</td>
                      <td className="py-1 pr-4">{plan.description}</td>
                      <td className="py-1 pr-4">{plan.billingType}</td>
                      <td className="py-1 pr-4">{plan.interval ?? "(null)"}</td>
                      <td className="py-1 pr-4">{plan.price}</td>
                      <td className="py-1 pr-4">{plan.currencyCode}</td>
                      <td className="py-1 pr-4">{plan.status}</td>
                      <td className="py-1 pr-4">{plan.highlights.join(" | ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      ) : (
        <p className="text-neutral-500 italic">The job has not fetched the details of this listing yet.</p>
      )}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-mono text-xs text-neutral-500">{label}</dt>
      <dd className="m-0 break-words">{value}</dd>
    </>
  );
}
