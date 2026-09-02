/**
 * Fanvue App Store listing types.
 *
 * Hand-derived from the public OpenAPI spec, operation `GET /apps/{appUuid}`
 * (`getAppStoreListing`), response `200`:
 * https://api.fanvue.com/docs/openapi.json
 *
 * The relevant excerpt of that spec (operation `GET /apps/{appUuid}`,
 * response `200`) is vendored in `docs/openapi.apps.json`. If the two ever
 * disagree, the live spec wins.
 */

export type PricingType = "free" | "monthly";

export type BillingType = "free" | "one_time" | "recurring";

export type BillingInterval = "monthly" | "yearly";

export type PricingPlanStatus = "pending_setup" | "active" | "withdrawn";

export type PricingPlan = {
  uuid: string;
  name: string;
  description: string | null;
  billingType: BillingType;
  interval: BillingInterval | null;
  /** Price in minor currency units (e.g. cents). 0 for free plans. */
  price: number;
  currencyCode: string;
  status: PricingPlanStatus;
  /** Marketing feature bullets for this plan's store card. */
  highlights: string[];
};

export type RatingDistributionEntry = {
  /** 1..5 */
  rating: number;
  /** Share of genuine ratings at this star, 0..1. */
  proportion: number;
  /** Genuine count at this star, or null below the floor. */
  count: number | null;
};

export type AppRating = {
  /** Weighted average rating (1-5), or null until the app has enough ratings to show. */
  average: number | null;
  /** Number of genuine ratings, or null until the app has enough to show. */
  count: number | null;
};

export type AppDeveloper = {
  /** The developer's public display name. */
  name: string | null;
  /** The developer's public Fanvue handle. */
  handle: string | null;
};

/** The summary shape returned by `GET /apps` (one element of `data`). */
export type AppListingSummary = {
  uuid: string;
  /** User-facing app title. */
  name: string;
  tagline: string;
  /** Marketing description of the app. */
  description: string;
  logoUrl: string;
  appUrl: string | null;
  pricingType: PricingType;
  rating: AppRating;
  developer: AppDeveloper;
};

/** The full listing returned by `GET /apps/{appUuid}`. */
export type AppListing = AppListingSummary & {
  descriptionTitle: string;
  descriptionBody: string;
  highlights: string[];
  heroImageUrl: string;
  previewImageUrls: string[];
  galleryImageUrls: string[];
  pricingPlans: PricingPlan[];
  ratingDistribution: RatingDistributionEntry[] | null;
};

/** Response envelope of `GET /apps?page=N&size=M`. */
export type PaginatedAppListings = {
  data: AppListingSummary[];
  pagination: {
    page: number;
    size: number;
    hasMore: boolean;
  };
};
