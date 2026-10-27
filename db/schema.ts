import type { Generated } from "kysely";

import type { BillingInterval, BillingType, PricingPlanStatus, PricingType } from "@/lib/fanvue/types";
import type { Severity } from "@/lib/moderation/rules";

/**
 * The tables in the moderation database, as Kysely sees them. Each key is a
 * table name and each value describes its columns. Add a table here when you
 * add a migration for it, and `getDb()` knows about it.
 *
 * `Generated<T>` marks a column the database fills in, so inserts can leave
 * it out. `JSONColumnType<T>`, also from `kysely`, is for a `jsonb` column:
 * insert `JSON.stringify(value)` and read it back as `T`.
 */
export interface Database {
  review_runs: ReviewRunsTable;
  listings: ListingsTable;
  listing_pricing_plans: ListingPricingPlansTable;
  reviews: ReviewsTable;
  findings: FindingsTable;
}

/** One row per run of the review job. The worked example. */
export interface ReviewRunsTable {
  id: Generated<number>;
  started_at: Generated<Date>;
  finished_at: Date | null;
  rule_revision: string;
  listing_count: number | null;
}

/**
 * One row per listing the job has seen. The `GET /apps` columns arrive first;
 * the detail columns stay null until the listing's `GET /apps/{uuid}` call.
 */
export interface ListingsTable {
  uuid: string;
  /** Submission order, ours: moved to the end when the worst severity changes. */
  position: number;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  app_url: string | null;
  pricing_type: PricingType;
  rating_average: number | null;
  rating_count: number | null;
  developer_name: string | null;
  developer_handle: string | null;
  description_title: string | null;
  description_body: string | null;
  highlights: string[] | null;
  hero_image_url: string | null;
  preview_image_urls: string[] | null;
  gallery_image_urls: string[] | null;
  fetched_at: Date;
  /** `null` until the detail call. */
  detail_fetched_at: Date | null;
}

/** A listing's `pricingPlans`, in their original order. */
export interface ListingPricingPlansTable {
  uuid: string;
  listing_uuid: string;
  sort_order: number;
  name: string;
  description: string | null;
  billing_type: BillingType;
  interval: BillingInterval | null;
  price: number;
  currency_code: string;
  status: PricingPlanStatus;
  highlights: string[];
}

/** One row per reviewed listing. No row means not reviewed yet. */
export interface ReviewsTable {
  listing_uuid: string;
  run_id: number;
  rule_revision: string;
  /** 0 reject, 1 fix, 2 warn, 3 no findings. */
  severity_rank: number;
  reviewed_at: Date;
}

/** One row per finding on a reviewed listing. */
export interface FindingsTable {
  id: Generated<number>;
  listing_uuid: string;
  code: string;
  rule: string;
  severity: Severity;
  message: string;
  field: string | null;
  evidence: string | null;
  related_listing_uuid: string | null;
}
