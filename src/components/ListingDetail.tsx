import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Card,
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fanvue/ui";
import Link from "next/link";
import type { ReactNode } from "react";

import type { ModeratorDecision } from "@/lib/moderation/decisions";
import { worstSeverity } from "@/lib/moderation/queue";
import { isFullListing, type StoredListing } from "@/lib/moderation/store";

import { DecisionStatus } from "./DecisionStatus";
import { FindingsList } from "./FindingsList";
import { HighlightedText, matchesFor } from "./HighlightedText";
import { SeverityPill } from "./SeverityPill";

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/**
 * One stored listing: its findings first, then the fields the rules work with,
 * with every match highlighted where it appears. Until the job has made the
 * listing's detail call, only the summary fields are stored.
 */
export function ListingDetail({ stored, decision }: { stored: StoredListing; decision: ModeratorDecision | null }) {
  const { listing, review } = stored;
  const full = isFullListing(listing) ? listing : null;
  const issues = review?.issues ?? [];
  const worst = worstSeverity(issues);

  return (
    <article className="flex flex-col gap-6 text-sm">
      <Breadcrumb>
        <BreadcrumbList size="14px">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Review queue</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>{listing.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-center gap-5">
        <img
          src={listing.logoUrl}
          alt=""
          width={72}
          height={72}
          className="size-[72px] flex-none rounded-[20px] border border-border-primary bg-surface-secondary object-cover"
        />
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] leading-10 font-bold tracking-[-0.02em]">{listing.name}</h1>
            {review ? (
              worst ? (
                <SeverityPill severity={worst}>
                  {worst} · {plural(issues.length, "finding", "findings")}
                </SeverityPill>
              ) : (
                <SeverityPill severity="none" />
              )
            ) : null}
          </div>
          <p className="text-base leading-6">
            <HighlightedText text={listing.tagline} terms={matchesFor(issues, "tagline")} />
          </p>
          <p className="text-content-secondary">
            {listing.developer.name ?? "Unknown developer"}
            {listing.developer.handle ? ` (@${listing.developer.handle})` : ""} · {capitalise(listing.pricingType)} ·{" "}
            {listing.rating.average === null
              ? "No ratings yet"
              : `Rated ${listing.rating.average} from ${plural(listing.rating.count ?? 0, "review", "reviews")}`}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <FindingsList review={review} />

          <Section title="Copy">
            <dl className="grid grid-cols-[minmax(120px,160px)_minmax(0,1fr)] gap-x-4 gap-y-3.5">
              <Field label="description">
                <HighlightedText text={listing.description} terms={matchesFor(issues, "description")} />
              </Field>
              {full ? (
                <>
                  <Field label="descriptionTitle">
                    <HighlightedText text={full.descriptionTitle} terms={matchesFor(issues, "descriptionTitle")} />
                  </Field>
                  <Field label="descriptionBody">
                    <HighlightedText text={full.descriptionBody} terms={matchesFor(issues, "descriptionBody")} />
                  </Field>
                  <Field label="highlights">
                    {full.highlights.length ? (
                      <span className="flex flex-wrap gap-1.5">
                        {full.highlights.map((highlight) => (
                          <span key={highlight} className="rounded-full bg-surface-secondary px-2.5 py-1 text-[13px]">
                            <HighlightedText text={highlight} terms={matchesFor(issues, "highlights")} />
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-content-tertiary">(none)</span>
                    )}
                  </Field>
                </>
              ) : null}
            </dl>
          </Section>

          {full ? (
            <>
              <Section
                title="Images"
                aside={`1 hero · ${plural(full.previewImageUrls.length, "preview", "previews")} · ${full.galleryImageUrls.length} gallery`}
              >
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                  <Thumbnail src={full.heroImageUrl} caption="heroImageUrl" aspect="aspect-[1200/630]" />
                  {full.previewImageUrls.map((url, index) => (
                    <Thumbnail
                      key={`preview-${index}`}
                      src={url}
                      caption={`previewImageUrls[${index}]`}
                      aspect="aspect-[800/500]"
                    />
                  ))}
                  {full.galleryImageUrls.map((url, index) => (
                    <Thumbnail
                      key={`gallery-${index}`}
                      src={url}
                      caption={`galleryImageUrls[${index}]`}
                      aspect="aspect-[1280/800]"
                    />
                  ))}
                </div>
              </Section>

              <Section title="Pricing plans">
                {full.pricingPlans.length === 0 ? (
                  <p className="text-content-tertiary">(no plans)</p>
                ) : (
                  <TableCard size="condensed" className="overflow-x-auto rounded-[16px] border-border-primary px-0 py-0">
                    <Table className="min-w-[640px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan</TableHead>
                          <TableHead>Billing</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Highlights</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {full.pricingPlans.map((plan) => (
                          <TableRow key={plan.uuid}>
                            <TableCell>
                              <div className="font-semibold">{plan.name}</div>
                              <div className="text-[13px] text-content-secondary">{plan.description}</div>
                            </TableCell>
                            <TableCell>
                              {capitalise(plan.billingType)}
                              {plan.interval ? `, ${plan.interval}` : ""}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              <div>{plan.price}</div>
                              <div className="text-xs text-content-tertiary">{plan.currencyCode}</div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  plan.status === "active"
                                    ? "bg-success-surface text-success-content"
                                    : "bg-surface-secondary text-content-secondary"
                                }`}
                              >
                                {capitalise(plan.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-content-secondary">
                              {plan.highlights.join(" · ")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableCard>
                )}
              </Section>
            </>
          ) : (
            <p className="text-content-tertiary italic">The job has not fetched the details of this listing yet.</p>
          )}
        </div>

        <aside aria-label="Decision and listing facts" className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
          <DecisionStatus decision={decision} />
          <Card type="container" className="flex flex-col gap-3.5 rounded-[24px] bg-background-primary">
            <h2 className="text-base leading-6 font-bold">Integration</h2>
            <dl className="flex flex-col gap-3">
              <Fact label="appUrl">
                {listing.appUrl ? (
                  <a href={listing.appUrl} className="text-info-content underline">
                    {listing.appUrl}
                  </a>
                ) : (
                  <span className="text-content-tertiary">(null)</span>
                )}
              </Fact>
              <Fact label="uuid">
                <span className="font-mono text-xs">{listing.uuid}</span>
              </Fact>
              <Fact label="logoUrl">
                <span className="text-[13px] text-content-secondary">{listing.logoUrl}</span>
              </Fact>
            </dl>
          </Card>
        </aside>
      </div>
    </article>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <Card type="container" className="flex flex-col gap-4 rounded-[24px] bg-background-primary">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl leading-7 font-bold">{title}</h2>
        {aside ? <span className="text-[13px] text-content-tertiary">{aside}</span> : null}
      </div>
      {children}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-mono text-xs leading-[22px] text-content-tertiary">{label}</dt>
      <dd className="m-0 leading-[22px] break-words">{children}</dd>
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-[11px] text-content-tertiary">{label}</dt>
      <dd className="m-0 [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function Thumbnail({ src, caption, aspect }: { src: string; caption: string; aspect: string }) {
  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <img
        src={src}
        alt=""
        className={`${aspect} w-full rounded-[12px] border border-border-primary bg-surface-secondary object-cover`}
      />
      <figcaption className="font-mono text-[11px] text-content-tertiary">{caption}</figcaption>
    </figure>
  );
}
