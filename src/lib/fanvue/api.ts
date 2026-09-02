import { listings } from "@fixtures/listings";

import type { AppListing, AppListingSummary, PaginatedAppListings } from "./types";

/**
 * The data boundary for the app: pure, synchronous functions over the fixtures
 * that behave like the live Fanvue endpoints they are named after
 * (see `docs/openapi.apps.json`). Pages call these directly; the route handlers
 * under `app/api/v0/apps` are thin HTTP wrappers around them.
 */

export const DEFAULT_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 50;

export type ListAppsParams = {
  /** 1-based page number. Default 1. */
  page?: number;
  /** Items per page, 1..50. Default 15. */
  size?: number;
  /** Case-insensitive substring filter, see {@link listApps}. */
  search?: string | null;
};

/**
 * Mirrors `GET /apps`.
 *
 * The spec describes `search` as "matched against the app's listing metadata";
 * our interpretation is a case-insensitive substring match over `name`,
 * `tagline`, `description` and `developer.name`. `pagination.size` is the
 * number of records returned on this page, as in the spec.
 */
export function listApps({ page = 1, size = DEFAULT_PAGE_SIZE, search }: ListAppsParams = {}): PaginatedAppListings {
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

/** Mirrors `GET /apps/{appUuid}`. Returns `null` when the uuid is unknown. */
export function getApp(uuid: string): AppListing | null {
  const wanted = uuid.toLowerCase();
  return listings.find((listing) => listing.uuid.toLowerCase() === wanted) ?? null;
}

/**
 * Every full listing, in queue order. The real list endpoint only returns
 * summaries, which lack most of the fields the rules need; a real review queue
 * would fetch each app's detail (or precompute findings in a server-side job).
 */
export function getAllApps(): AppListing[] {
  const all: AppListing[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const result = listApps({ page, size: MAX_PAGE_SIZE });
    for (const summary of result.data) {
      const listing = getApp(summary.uuid);
      if (listing) all.push(listing);
    }
    hasMore = result.pagination.hasMore;
    page += 1;
  }
  return all;
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
