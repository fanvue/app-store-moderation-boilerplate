import type { AppListing } from "@/lib/fanvue/types";

export type Severity = "reject" | "fix" | "warn";

/**
 * One moderation finding on a listing.
 *
 * - `code`: stable machine-readable id for the check (e.g. `"too_few_screenshots"`); tests and UI key off it.
 * - `rule`: section number from `docs/listing-requirements.md` (e.g. `"2.3"`).
 * - `severity`: what the reviewer should do about it.
 * - `message`: explanation shown to the reviewer.
 * - `field`: optional path into the listing, e.g. `appUrl` or `pricingPlans[0].price`.
 */
export type Issue = {
  code: string;
  rule: string;
  severity: Severity;
  message: string;
  field?: string;
};

/**
 * Runs every deterministic rule check against a listing and returns the findings.
 * Pure: no I/O, same input always gives the same output. See README.md.
 */
export function validateListing(listing: AppListing): Issue[] {
  void listing;
  return [];
}
