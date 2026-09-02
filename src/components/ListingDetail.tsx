"use client";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Link,
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollArea,
} from "@fanvue/ui";
import NextLink from "next/link";
import type { ReactNode } from "react";

import type { AppListing, PricingPlan } from "@/lib/fanvue/types";
import type { Issue } from "@/lib/moderation/rules";

import { FindingsList } from "./FindingsList";

export function ListingDetail({ listing, issues }: { listing: AppListing; issues: Issue[] }) {
  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <header className="flex flex-wrap items-start gap-4">
        <img src={listing.logoUrl} alt="" width={72} height={72} className="size-18 rounded-2xl object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="typography-header-heading-lg m-0">{listing.name}</h1>
          <p className="typography-body-default-16px-regular m-0 text-content-secondary">{listing.tagline}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={listing.pricingType === "free" ? "default" : "brandLight"}>{listing.pricingType}</Badge>
            <span className="typography-description-12px-regular text-content-secondary">
              {listing.developer.name ?? "Unknown developer"}
              {listing.developer.handle ? ` (@${listing.developer.handle})` : ""}
            </span>
            <span className="typography-description-12px-regular text-content-secondary">
              Rating: {listing.rating.average ?? "-"} ({listing.rating.count ?? 0})
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Copy</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="description" value={listing.description} />
              <Field label="descriptionTitle" value={listing.descriptionTitle} />
              <Field label="descriptionBody" value={listing.descriptionBody} />
              <div>
                <FieldLabel>highlights</FieldLabel>
                {listing.highlights.length === 0 ? (
                  <Muted>none</Muted>
                ) : (
                  <ul className="typography-body-small-14px-regular m-0 list-disc pl-5">
                    {listing.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <FieldLabel>heroImageUrl</FieldLabel>
                <img src={listing.heroImageUrl} alt="" className="w-full max-w-xl rounded-2xl" />
              </div>
              <ImageStrip label="previewImageUrls" urls={listing.previewImageUrls} />
              <ImageStrip label="galleryImageUrls" urls={listing.galleryImageUrls} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing plans</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.pricingPlans.length === 0 ? (
                <Muted>No pricing plans.</Muted>
              ) : (
                <TableCard size="condensed">
                  <TableScrollArea>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead intent="leading">Plan</TableHead>
                          <TableHead>Billing</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Highlights</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {listing.pricingPlans.map((plan) => (
                          <TableRow key={plan.uuid}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="typography-body-small-14px-semibold">{plan.name}</span>
                                {plan.description ? <Muted>{plan.description}</Muted> : null}
                              </div>
                            </TableCell>
                            <TableCell>
                              {plan.billingType}
                              {plan.interval ? ` / ${plan.interval}` : ""}
                            </TableCell>
                            <TableCell>
                              {formatPrice(plan)}{" "}
                              <Muted>
                                ({plan.price} {plan.currencyCode} minor units)
                              </Muted>
                            </TableCell>
                            <TableCell>
                              <Badge variant={plan.status === "active" ? "successColour" : "warningColour"}>
                                {plan.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{plan.highlights.join(", ") || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableScrollArea>
                </TableCard>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <FieldLabel>appUrl</FieldLabel>
                {listing.appUrl ? (
                  <Link href={listing.appUrl} target="_blank" rel="noreferrer" size="14">
                    {listing.appUrl}
                  </Link>
                ) : (
                  <Muted>null</Muted>
                )}
              </div>
              <Field label="uuid" value={listing.uuid} mono />
              <Field label="logoUrl" value={listing.logoUrl} mono />
              <div>
                <FieldLabel>ratingDistribution</FieldLabel>
                {listing.ratingDistribution === null ? (
                  <Muted>null</Muted>
                ) : (
                  <ul className="typography-body-small-14px-regular m-0 list-none p-0">
                    {listing.ratingDistribution.map((entry) => (
                      <li key={entry.rating}>
                        {entry.rating} star: {Math.round(entry.proportion * 100)}% ({entry.count ?? "-"})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <FindingsList issues={issues} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link asChild size="14">
      <NextLink href="/">Back to review queue</NextLink>
    </Link>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <p className="typography-description-12px-semibold m-0 mb-1 text-content-secondary">{children}</p>;
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="typography-description-12px-regular text-content-tertiary">{children}</span>;
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p
        className={`typography-body-small-14px-regular m-0 whitespace-pre-wrap break-words ${mono ? "font-mono" : ""}`}
      >
        {value || <Muted>empty</Muted>}
      </p>
    </div>
  );
}

function ImageStrip({ label, urls }: { label: string; urls: string[] }) {
  return (
    <div>
      <FieldLabel>{`${label} (${urls.length})`}</FieldLabel>
      {urls.length === 0 ? (
        <Muted>none</Muted>
      ) : (
        <div className="flex flex-wrap gap-2">
          {urls.map((url) => (
            <img key={url} src={url} alt="" className="h-24 w-auto rounded-xl border border-border-primary" />
          ))}
        </div>
      )}
    </div>
  );
}

/** Prices are minor currency units (cents for USD); assumes a 2-decimal currency. */
function formatPrice(plan: PricingPlan): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: plan.currencyCode }).format(plan.price / 100);
  } catch {
    return `${(plan.price / 100).toFixed(2)} ${plan.currencyCode}`;
  }
}
