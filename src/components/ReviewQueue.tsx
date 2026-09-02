"use client";

import {
  Badge,
  EmptyState,
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeader,
  TableMediaThumbnail,
  TableRow,
  TableScrollArea,
  TableStackedText,
} from "@fanvue/ui";
import { useRouter } from "next/navigation";

import type { AppListing } from "@/lib/fanvue/types";
import type { Issue, Severity } from "@/lib/moderation/rules";

import { SEVERITY_BADGE_VARIANT, SEVERITY_LABEL } from "./FindingsList";

export type ReviewQueueRow = {
  listing: AppListing;
  issues: Issue[];
};

export function ReviewQueue({ rows }: { rows: ReviewQueueRow[] }) {
  const router = useRouter();

  if (rows.length === 0) {
    return <EmptyState variant="centered" title="Queue is empty" description="No listings to review." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="typography-header-heading-lg m-0">Review queue</h1>
        <p className="typography-body-small-14px-regular m-0 mt-1 text-content-secondary">
          {rows.length} listings. Select a row to open the full listing.
        </p>
      </div>

      <TableCard size="condensed">
        <TableScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead intent="leading">App</TableHead>
                <TableHead>Developer</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Screenshots</TableHead>
                <TableHead>Findings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ listing, issues }) => (
                <TableRow
                  key={listing.uuid}
                  className="cursor-pointer"
                  tabIndex={0}
                  onClick={() => router.push(`/listings/${listing.uuid}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/listings/${listing.uuid}`);
                    }
                  }}
                >
                  <TableCell intent="stacked">
                    <div className="flex items-center gap-3">
                      <TableMediaThumbnail src={listing.logoUrl} alt="" size="32" />
                      <TableStackedText title={listing.name} subtitle={listing.tagline} />
                    </div>
                  </TableCell>
                  <TableCell>{listing.developer.handle ? `@${listing.developer.handle}` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={listing.pricingType === "free" ? "default" : "brandLight"}>
                      {listing.pricingType}
                    </Badge>
                  </TableCell>
                  <TableCell>{listing.previewImageUrls.length}</TableCell>
                  <TableCell>
                    <FindingsCell issues={issues} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScrollArea>
      </TableCard>
    </div>
  );
}

/**
 * `validateListing` currently returns `[]` for every listing, so this renders
 * "Not checked". Once rules exist, a clean listing also returns `[]`; you will
 * want to tell "no findings" apart from "not checked".
 */
function FindingsCell({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return <Badge variant="default">Not checked</Badge>;
  }

  const counts = issues.reduce<Partial<Record<Severity, number>>>((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1">
      {(Object.keys(counts) as Severity[]).map((severity) => (
        <Badge key={severity} variant={SEVERITY_BADGE_VARIANT[severity]} leftDot>
          {counts[severity]} {SEVERITY_LABEL[severity]}
        </Badge>
      ))}
    </div>
  );
}
