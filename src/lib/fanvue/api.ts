import { experiences } from "@fixtures/experiences";
import { listings } from "@fixtures/listings";

import type { FanExperience } from "./experiences";
import type { AppListing, AppListingSummary, PaginatedAppListings } from "./types";

/**
 * The data boundary for the app: asynchronous functions over the fixtures
 * that behave like the live Fanvue endpoints they are named after
 * (see `docs/openapi.apps.json`). Pages call these directly; the route handlers
 * under `app/api/v0/apps` are thin HTTP wrappers around them.
 *
 * Two things about the live API are reproduced here on purpose, and the
 * README says so:
 *
 * - Every call costs time. `MOCK_API_LATENCY_MS` (default 3) is a stand-in
 *   for a round trip, so reviewing the whole store on a page load is visibly
 *   slow rather than secretly free.
 * - Every call is counted. `apiCallCount()` lets a page say how many calls it
 *   made. The live API allows 200 a minute; the mock does not enforce that,
 *   but the count tells you whether a design would survive it.
 *
 * There is no "give me everything" call, because the live API has none.
 */

export const DEFAULT_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 50;

/** What the live API allows per minute. Stated, not enforced, by the mock. */
export const LIVE_RATE_LIMIT_PER_MINUTE = 200;

const LATENCY_MS = Number(process.env.MOCK_API_LATENCY_MS ?? 3);

let calls = 0;

/**
 * Total mock API calls since the process started. One counter for the whole
 * process, so two overlapping requests see each other's calls; it is a dev
 * aid, not a meter.
 */
export function apiCallCount(): number {
  return calls;
}

async function roundTrip(): Promise<void> {
  calls += 1;
  if (LATENCY_MS > 0) await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

export type ListAppsParams = {
  /** 1-based page number. Default 1. */
  page?: number;
  /** Items per page, 1..50. Default 15. */
  size?: number;
  /** Case-insensitive substring filter, see {@link listApps}. */
  search?: string | null;
};

/**
 * Mirrors `GET /apps`. Summaries only: the fields the rules need come from
 * {@link getApp}, one call per listing.
 *
 * The spec describes `search` as "matched against the app's listing metadata";
 * our interpretation is a case-insensitive substring match over `name`,
 * `tagline`, `description` and `developer.name`. `pagination.size` is the
 * number of records returned on this page, as in the spec.
 */
export async function listApps({
  page = 1,
  size = DEFAULT_PAGE_SIZE,
  search,
}: ListAppsParams = {}): Promise<PaginatedAppListings> {
  await roundTrip();

  const needle = search?.trim().toLowerCase() ?? "";
  const matched = needle
    ? listings.filter((listing) =>
        [listing.name, listing.tagline, listing.description, listing.developer.name ?? ""].some((text) =>
          text.toLowerCase().includes(needle),
        ),
      )
    : listings;

  const start = (page - 1) * size;
  const data = matched.slice(start, start + size).map(toListingSummary);

  return {
    data,
    pagination: { page, size: data.length, hasMore: start + size < matched.length },
  };
}

/** Mirrors `GET /apps/{appUuid}`. Resolves `null` when the uuid is unknown. */
export async function getApp(uuid: string): Promise<AppListing | null> {
  await roundTrip();

  const wanted = uuid.toLowerCase();
  return listings.find((listing) => listing.uuid.toLowerCase() === wanted) ?? null;
}

/**
 * Every live experience, newest first.
 *
 * The public API has no cross-creator list: `GET /experiences?appUuid=` is
 * scoped to one app and the creator whose token is calling. A review tool
 * reads an internal feed instead, and this stands in for a backfill of it. In
 * production the feed is event-driven: a publish or an update arrives as it
 * happens, which is what `app/api/moderation/events` receives.
 */
export async function getAllExperiences(): Promise<FanExperience[]> {
  await roundTrip();

  return [...experiences].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Projects a full listing down to exactly the fields `GET /apps` returns per item. */
function toListingSummary(listing: AppListing): AppListingSummary {
  return {
    uuid: listing.uuid,
    name: listing.name,
    tagline: listing.tagline,
    description: listing.description,
    logoUrl: listing.logoUrl,
    appUrl: listing.appUrl,
    pricingType: listing.pricingType,
    rating: listing.rating,
    developer: listing.developer,
  };
}
