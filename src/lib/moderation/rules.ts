import type { AppListing } from "@/lib/fanvue/types";

export type Severity = "reject" | "fix" | "warn";

/**
 * One moderation finding on a listing.
 *
 * - `code`: stable machine-readable id for the check (e.g. `"too_few_screenshots"`).
 * - `rule`: section number from `docs/listing-requirements.md` (e.g. `"2.3"`).
 * - `severity`: what should happen next. Your call per rule, and we will ask why.
 * - `message`: what a moderator reads.
 * - `field`: optional path into the listing, e.g. `appUrl` or `pricingPlans[0].price`.
 */
export type Issue = {
  code: string;
  rule: string;
  severity: Severity;
  message: string;
  field?: string;
};

/** One listing and everything the rules found on it. */
export type Review = {
  listing: AppListing;
  issues: Issue[];
};

/**
 * Reviews a set of listings and returns the findings for each, in the order
 * they came in.
 *
 * This is the entry point the spec test calls and the pages render, and it
 * takes the whole set rather than one listing. How the work inside is
 * organised is up to you.
 *
 * Pure: no I/O, and the same input always gives the same output.
 */
export function reviewListings(listings: AppListing[]): Review[] {
  return listings.map((listing) => ({ listing, issues: checkListing(listing) }));
}

/** Every check that only needs the one listing in front of it. */
function checkListing(listing: AppListing): Issue[] {
  return [...checkScreenshotCount(listing)];
}

/**
 * Rule 2.3, and the worked example for the rest: "At least two screenshots of
 * the product... Two entries pointing at the same image are one screenshot,
 * not two."
 *
 * `fix` because a developer can add a screenshot without anyone making a
 * judgement call. Argue for something else if you disagree — bring the
 * accept-with-fixes bar in 4.5 with you.
 */
function checkScreenshotCount(listing: AppListing): Issue[] {
  const distinct = new Set(listing.previewImageUrls).size;
  if (distinct >= 2) return [];

  return [
    {
      code: "too_few_screenshots",
      rule: "2.3",
      severity: "fix",
      message:
        distinct === listing.previewImageUrls.length
          ? `Only ${distinct} screenshot${distinct === 1 ? "" : "s"}; rule 2.3 needs two.`
          : `${listing.previewImageUrls.length} screenshots but only ${distinct} distinct; rule 2.3 needs two.`,
      field: "previewImageUrls",
    },
  ];
}
