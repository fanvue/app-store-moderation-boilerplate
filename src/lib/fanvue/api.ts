import { experiences } from "@fixtures/experiences";
import { listings } from "@fixtures/listings";

import type { FanExperience } from "./experiences";
import type { AppListing, AppListingSummary, PaginatedAppListings } from "./types";

/**
 * The mock Fanvue API, over the fixtures. Pages call these directly; the
 * routes under `app/api/v0/apps` wrap them.
 *
 * Every call waits `MOCK_API_LATENCY_MS` (default 3) and is counted by
 * `apiCallCount()`. `docs/production.md` lists the rest.
 */

export const DEFAULT_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 50;

/** What the live API allows per minute. Stated, not enforced, by the mock. */
export const LIVE_RATE_LIMIT_PER_MINUTE = 200;

const LATENCY_MS = Number(process.env.MOCK_API_LATENCY_MS ?? 3);

let calls = 0;

/** Total mock API calls since the process started, across all requests. */
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
 * {@link getApp}, one call per listing. `pagination.size` is the number of
 * records returned on this page.
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
 * Every live experience, newest first: a one-off backfill. In production,
 * experiences arrive as events at `app/api/moderation/events`.
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
