import type { AppListing } from "@/lib/fanvue/types";

export type Severity = "reject" | "fix" | "warn";

/**
 * One moderation finding on a listing.
 *
 * - `code`: a stable, machine-readable identifier for this specific check
 *   (e.g. `"too_few_screenshots"`). Tests and UI filters key off it, so do not
 *   change it once introduced.
 * - `rule`: the section of the public App Store Listing Requirements the
 *   finding is grounded in, using the doc's own numbering (e.g. `"2.3"`).
 *   The doc is vendored at `docs/listing-requirements.md`.
 * - `severity`: what a reviewer should do about it.
 * - `message`: human-readable explanation shown to the reviewer.
 * - `field`: a path into the listing the finding points at, when there is
 *   one, for example `appUrl` or `pricingPlans[0].price`.
 */
export type Issue = {
  code: string;
  rule: string;
  severity: Severity;
  message: string;
  field?: string;
};

/**
 * Runs every deterministic rule check against a listing and returns the
 * findings. Pure: no I/O, same input always gives the same output.
 *
 * TODO: candidate implements. Start with `docs/listing-requirements.md` (rule
 * numbers) and `src/lib/fanvue/types.ts` (the shape of `listing`).
 */
export function validateListing(listing: AppListing): Issue[] {
  void listing;
  return [];
}
