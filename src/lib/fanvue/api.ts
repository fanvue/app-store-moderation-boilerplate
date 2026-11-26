/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is part of the mock of the live Fanvue API, which is someone else's system.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

import { currentListings, recordCall } from "./mock-state";
import type { AppListing, AppListingSummary, PaginatedAppListings } from "./types";

/**
 * The mock Fanvue API, built on the fixtures. Call these functions directly.
 * The routes under `app/api/v0/apps` wrap them.
 *
 * Every call waits `MOCK_API_LATENCY_MS` (default 3) and is counted.
 * `npm run measure` reports the count. The README describes the rest of its
 * behaviour.
 */

export const DEFAULT_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 50;

/** What the live API allows per minute. Stated, not enforced, by the mock. */
export const LIVE_RATE_LIMIT_PER_MINUTE = 200;

const LATENCY_MS = Number(process.env.MOCK_API_LATENCY_MS ?? 3);

let calls = 0;

/** Mock API calls made by this process since it started. */
export function apiCallCount(): number {
  return calls;
}

async function roundTrip(kind: "list" | "detail"): Promise<void> {
  calls += 1;
  recordCall(kind);
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
 * {@link getApp}, one call per listing. `pagination.size` is the number of
 * records returned on this page.
 */
export async function listApps({
  page = 1,
  size = DEFAULT_PAGE_SIZE,
  search,
}: ListAppsParams = {}): Promise<PaginatedAppListings> {
  await roundTrip("list");

  const listings = currentListings();
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
  await roundTrip("detail");

  const wanted = uuid.toLowerCase();
  return currentListings().find((listing) => listing.uuid.toLowerCase() === wanted) ?? null;
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
