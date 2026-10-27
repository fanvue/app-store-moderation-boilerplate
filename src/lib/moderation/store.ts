import type { Kysely, Selectable } from "kysely";

import type { Database, FindingsTable, ListingPricingPlansTable, ListingsTable } from "@db/schema";
import { getDb } from "@/lib/db/client";
import type { AppListing, AppListingSummary, PricingPlan } from "@/lib/fanvue/types";

import { SEVERITY_ORDER, worstSeverity } from "./queue";
import type { Issue, Review, Severity } from "./rules";

/**
 * The index the queue reads: listings the job fetched and the reviews it
 * wrote, sorted by severity, a page at a time. Tables are in
 * `db/migrations/0002_listings_reviews_findings.ts`.
 */

export type QueueFilter = {
  /** 1-based. */
  page: number;
  size: number;
  /** A moderator-chosen order. Without it, the default queue order. */
  sort?: QueueSort;
  /** Only listings whose worst severity is this. Without it, every listing, reviewed or not. */
  severity?: QueueSeverity;
  /** Only listings whose name or developer handle contains this, ignoring case. */
  q?: string;
};

/** A listing's worst severity, or `none` when every rule passed. */
export type QueueSeverity = Severity | "none";

/** How many listings matching the search have each worst severity. `all` counts them all, reviewed or not. */
export type QueueCounts = Record<QueueSeverity | "all", number>;

/** The queue columns a moderator can sort by. Severity ascending is most serious first. */
export type QueueSort = {
  column: "severity" | "developer";
  direction: "asc" | "desc";
};

/**
 * One stored listing and its review. `listing` is a summary until the job has
 * made its detail call. `review` is `null` until the rules have run on it.
 */
export type StoredListing = {
  listing: AppListingSummary | AppListing;
  review: StoredReview | null;
};

export type StoredReview = {
  issues: Issue[];
  /** The revision of `docs/listing-requirements.md` the findings were made under. */
  ruleRevision: string;
  /** ISO 8601. */
  reviewedAt: string;
};

export type QueuePage = {
  /** Not reviewed first, then most serious first, then submission order. */
  rows: StoredListing[];
  /** Every listing that matches the severity filter, across all pages. */
  total: number;
  counts: QueueCounts;
  page: number;
  size: number;
  /** When the job last finished, or `null` if it never has. The queue shows this. */
  reviewedAt: string | null;
  /** The revision of `docs/listing-requirements.md` that run used. */
  ruleRevision: string | null;
};

export type ReviewStore = {
  /**
   * Upserts listings, in submission order. A summary updates only the
   * `GET /apps` columns; a full listing also replaces its detail columns and
   * pricing plans. A listing seen for the first time goes to the end of
   * submission order; one seen before keeps its place.
   */
  saveListings(listings: (AppListingSummary | AppListing)[]): Promise<void>;
  /**
   * Replaces what is stored for each listing in `reviews`. A listing whose
   * worst severity changed since its last review moves to the end of
   * submission order. Its first review does not move it.
   */
  saveReviews(reviews: Review[], ruleRevision: string, runId: number): Promise<void>;
  /** One stored listing, or `null` if the job has never seen it. */
  getReview(uuid: string): Promise<StoredListing | null>;
  /** One page of the queue. */
  getQueuePage(filter: QueueFilter): Promise<QueuePage>;
  /** Every stored listing and its review, in submission order. For re-reviewing the whole set after an edit. */
  getAll(): Promise<StoredListing[]>;
};

const SORT_COLUMNS = {
  severity: "reviews.severity_rank",
  developer: "listings.developer_handle",
} as const;

/** PGlite runs one statement at a time, so writes go in short transactions of this many listings. */
const CHUNK_SIZE = 200;

/** `severity_rank`: the index in `SEVERITY_ORDER`, or 3 when every rule passed. */
const NO_FINDINGS_RANK = SEVERITY_ORDER.length;

/** An `ilike` pattern that finds `q` anywhere, with `%`, `_` and `\\` matched literally. */
const containsPattern = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;

const rankOf = (severity: QueueSeverity): number =>
  severity === "none" ? NO_FINDINGS_RANK : SEVERITY_ORDER.indexOf(severity);

export function createReviewStore(db: Kysely<Database> = getDb()): ReviewStore {
  return {
    async saveListings(listings) {
      for (const chunk of chunks(listings)) {
        await db.transaction().execute(async (trx) => {
          const { max } = await trx
            .selectFrom("listings")
            .select((eb) => eb.fn.coalesce(eb.fn.max("position"), eb.lit(0)).as("max"))
            .executeTakeFirstOrThrow();
          const now = new Date();

          // New listings take the next positions; existing ones keep theirs, because
          // the conflict updates every column except `position`.
          const rows = chunk.map((listing, index) => ({ listing, position: max + 1 + index }));
          const summaries = rows.filter(({ listing }) => !isFullListing(listing));
          const details = rows.flatMap(({ listing, position }) =>
            isFullListing(listing) ? [{ listing, position }] : [],
          );

          if (summaries.length > 0) {
            await trx
              .insertInto("listings")
              .values(
                summaries.map(({ listing, position }) => ({ ...summaryColumns(listing), position, fetched_at: now })),
              )
              .onConflict((oc) =>
                oc.column("uuid").doUpdateSet((eb) => ({
                  name: eb.ref("excluded.name"),
                  tagline: eb.ref("excluded.tagline"),
                  description: eb.ref("excluded.description"),
                  logo_url: eb.ref("excluded.logo_url"),
                  app_url: eb.ref("excluded.app_url"),
                  pricing_type: eb.ref("excluded.pricing_type"),
                  rating_average: eb.ref("excluded.rating_average"),
                  rating_count: eb.ref("excluded.rating_count"),
                  developer_name: eb.ref("excluded.developer_name"),
                  developer_handle: eb.ref("excluded.developer_handle"),
                  fetched_at: eb.ref("excluded.fetched_at"),
                })),
              )
              .execute();
          }

          if (details.length > 0) {
            await trx
              .insertInto("listings")
              .values(
                details.map(({ listing, position }) => ({
                  ...summaryColumns(listing),
                  ...detailColumns(listing),
                  position,
                  fetched_at: now,
                  detail_fetched_at: now,
                })),
              )
              .onConflict((oc) =>
                oc.column("uuid").doUpdateSet((eb) => ({
                  name: eb.ref("excluded.name"),
                  tagline: eb.ref("excluded.tagline"),
                  description: eb.ref("excluded.description"),
                  logo_url: eb.ref("excluded.logo_url"),
                  app_url: eb.ref("excluded.app_url"),
                  pricing_type: eb.ref("excluded.pricing_type"),
                  rating_average: eb.ref("excluded.rating_average"),
                  rating_count: eb.ref("excluded.rating_count"),
                  developer_name: eb.ref("excluded.developer_name"),
                  developer_handle: eb.ref("excluded.developer_handle"),
                  description_title: eb.ref("excluded.description_title"),
                  description_body: eb.ref("excluded.description_body"),
                  highlights: eb.ref("excluded.highlights"),
                  hero_image_url: eb.ref("excluded.hero_image_url"),
                  preview_image_urls: eb.ref("excluded.preview_image_urls"),
                  gallery_image_urls: eb.ref("excluded.gallery_image_urls"),
                  fetched_at: eb.ref("excluded.fetched_at"),
                  detail_fetched_at: eb.ref("excluded.detail_fetched_at"),
                })),
              )
              .execute();

            const uuids = details.map(({ listing }) => listing.uuid);
            await trx.deleteFrom("listing_pricing_plans").where("listing_uuid", "in", uuids).execute();
            const plans = details.flatMap(({ listing }) =>
              listing.pricingPlans.map((plan, index) => planColumns(listing.uuid, plan, index)),
            );
            if (plans.length > 0) await trx.insertInto("listing_pricing_plans").values(plans).execute();
          }
        });
      }
    },

    async saveReviews(reviews, ruleRevision, runId) {
      for (const chunk of chunks(reviews)) {
        await db.transaction().execute(async (trx) => {
          const uuids = chunk.map(({ listing }) => listing.uuid);
          const newRanks = new Map(chunk.map(({ listing, issues }) => [listing.uuid, severityRank(issues)]));

          const previous = await trx
            .selectFrom("reviews")
            .innerJoin("listings", "listings.uuid", "reviews.listing_uuid")
            .select(["reviews.listing_uuid", "reviews.severity_rank", "listings.position"])
            .where("reviews.listing_uuid", "in", uuids)
            .orderBy("listings.position")
            .execute();

          // The position rule: a changed worst severity sends the listing to the end
          // of submission order. Listings that move together keep their relative order.
          const moved = previous.filter((row) => row.severity_rank !== newRanks.get(row.listing_uuid));
          if (moved.length > 0) {
            const { max } = await trx
              .selectFrom("listings")
              .select((eb) => eb.fn.max("position").as("max"))
              .executeTakeFirstOrThrow();
            for (const [index, row] of moved.entries()) {
              await trx
                .updateTable("listings")
                .set({ position: (max ?? 0) + 1 + index })
                .where("uuid", "=", row.listing_uuid)
                .execute();
            }
          }

          const reviewedAt = new Date();
          await trx
            .insertInto("reviews")
            .values(
              chunk.map(({ listing, issues }) => ({
                listing_uuid: listing.uuid,
                run_id: runId,
                rule_revision: ruleRevision,
                severity_rank: severityRank(issues),
                reviewed_at: reviewedAt,
              })),
            )
            .onConflict((oc) =>
              oc.column("listing_uuid").doUpdateSet((eb) => ({
                run_id: eb.ref("excluded.run_id"),
                rule_revision: eb.ref("excluded.rule_revision"),
                severity_rank: eb.ref("excluded.severity_rank"),
                reviewed_at: eb.ref("excluded.reviewed_at"),
              })),
            )
            .execute();

          await trx.deleteFrom("findings").where("listing_uuid", "in", uuids).execute();
          const findings = chunk.flatMap(({ listing, issues }) =>
            issues.map((issue) => ({
              listing_uuid: listing.uuid,
              code: issue.code,
              rule: issue.rule,
              severity: issue.severity,
              message: issue.message,
              field: issue.field ?? null,
              evidence: issue.matched ?? null,
              related_listing_uuid: issue.relatedListingUuid ?? null,
            })),
          );
          if (findings.length > 0) await trx.insertInto("findings").values(findings).execute();
        });
      }
    },

    async getReview(uuid) {
      const row = await db
        .selectFrom("listings")
        .leftJoin("reviews", "reviews.listing_uuid", "listings.uuid")
        .selectAll("listings")
        .select(["reviews.rule_revision", "reviews.reviewed_at"])
        .where("listings.uuid", "=", uuid)
        .executeTakeFirst();
      if (!row) return null;

      const [stored] = await assemble(db, [row]);
      return stored ?? null;
    },

    async getQueuePage({ page, size, sort, severity, q }) {
      const pattern = q ? containsPattern(q) : null;
      const rows = await db
        .selectFrom("listings")
        .leftJoin("reviews", "reviews.listing_uuid", "listings.uuid")
        .selectAll("listings")
        .select(["reviews.rule_revision", "reviews.reviewed_at"])
        .$call((query) =>
          pattern
            ? query.where((eb) =>
                eb.or([eb("listings.name", "ilike", pattern), eb("listings.developer_handle", "ilike", pattern)]),
              )
            : query,
        )
        .$call((query) => (severity ? query.where("reviews.severity_rank", "=", rankOf(severity)) : query))
        // Not reviewed and no developer handle have nothing to sort on, so they go last either way.
        .$call((query) =>
          sort
            ? query.orderBy(SORT_COLUMNS[sort.column], (ob) =>
                (sort.direction === "asc" ? ob.asc() : ob.desc()).nullsLast(),
              )
            : query.orderBy("reviews.severity_rank", (ob) => ob.asc().nullsFirst()),
        )
        .orderBy("listings.position")
        .limit(size)
        .offset((page - 1) * size)
        .execute();

      const ranks = await db
        .selectFrom("listings")
        .leftJoin("reviews", "reviews.listing_uuid", "listings.uuid")
        .select(["reviews.severity_rank", (eb) => eb.fn.countAll<number>().as("count")])
        .$call((query) =>
          pattern
            ? query.where((eb) =>
                eb.or([eb("listings.name", "ilike", pattern), eb("listings.developer_handle", "ilike", pattern)]),
              )
            : query,
        )
        .groupBy("reviews.severity_rank")
        .execute();
      const countFor = (rank: number) => Number(ranks.find((row) => row.severity_rank === rank)?.count ?? 0);
      const counts: QueueCounts = {
        all: ranks.reduce((sum, row) => sum + Number(row.count), 0),
        reject: countFor(rankOf("reject")),
        fix: countFor(rankOf("fix")),
        warn: countFor(rankOf("warn")),
        none: countFor(NO_FINDINGS_RANK),
      };

      const lastRun = await db
        .selectFrom("review_runs")
        .select(["finished_at", "rule_revision"])
        .where("finished_at", "is not", null)
        .orderBy("finished_at", "desc")
        .limit(1)
        .executeTakeFirst();

      return {
        rows: await assemble(db, rows),
        total: severity ? counts[severity] : counts.all,
        counts,
        page,
        size,
        reviewedAt: lastRun?.finished_at?.toISOString() ?? null,
        ruleRevision: lastRun?.rule_revision ?? null,
      };
    },

    async getAll() {
      const rows = await db
        .selectFrom("listings")
        .leftJoin("reviews", "reviews.listing_uuid", "listings.uuid")
        .selectAll("listings")
        .select(["reviews.rule_revision", "reviews.reviewed_at"])
        .orderBy("listings.position")
        .execute();
      return assemble(db, rows);
    },
  };
}

type ListingRow = Selectable<ListingsTable> & { rule_revision: string | null; reviewed_at: Date | null };

/** Adds pricing plans and findings to listing rows, with one query each for the whole set. */
async function assemble(db: Kysely<Database>, rows: ListingRow[]): Promise<StoredListing[]> {
  const uuids = rows.map((row) => row.uuid);
  if (uuids.length === 0) return [];

  const plans = await db
    .selectFrom("listing_pricing_plans")
    .selectAll()
    .where("listing_uuid", "in", uuids)
    .orderBy("sort_order")
    .execute();
  const findings = await db
    .selectFrom("findings")
    .selectAll()
    .where("listing_uuid", "in", uuids)
    .orderBy("id")
    .execute();

  const plansByListing = Map.groupBy(plans, (plan) => plan.listing_uuid);
  const findingsByListing = Map.groupBy(findings, (finding) => finding.listing_uuid);

  return rows.map((row) => ({
    listing: toListing(row, plansByListing.get(row.uuid) ?? []),
    review:
      row.rule_revision && row.reviewed_at
        ? {
            issues: (findingsByListing.get(row.uuid) ?? []).map(toIssue),
            ruleRevision: row.rule_revision,
            reviewedAt: row.reviewed_at.toISOString(),
          }
        : null,
  }));
}

/** True when the job has the listing's detail call, not only its `GET /apps` summary. */
export function isFullListing(listing: AppListingSummary | AppListing): listing is AppListing {
  return "previewImageUrls" in listing;
}

function severityRank(issues: Issue[]): number {
  return rankOf(worstSeverity(issues) ?? "none");
}

function* chunks<T>(items: T[]): Generator<T[]> {
  for (let start = 0; start < items.length; start += CHUNK_SIZE) yield items.slice(start, start + CHUNK_SIZE);
}

function summaryColumns(listing: AppListingSummary) {
  return {
    uuid: listing.uuid,
    name: listing.name,
    tagline: listing.tagline,
    description: listing.description,
    logo_url: listing.logoUrl,
    app_url: listing.appUrl,
    pricing_type: listing.pricingType,
    rating_average: listing.rating.average,
    rating_count: listing.rating.count,
    developer_name: listing.developer.name,
    developer_handle: listing.developer.handle,
  };
}

function detailColumns(listing: AppListing) {
  return {
    description_title: listing.descriptionTitle,
    description_body: listing.descriptionBody,
    highlights: listing.highlights,
    hero_image_url: listing.heroImageUrl,
    preview_image_urls: listing.previewImageUrls,
    gallery_image_urls: listing.galleryImageUrls,
  };
}

function planColumns(listingUuid: string, plan: PricingPlan, index: number): Selectable<ListingPricingPlansTable> {
  return {
    uuid: plan.uuid,
    listing_uuid: listingUuid,
    sort_order: index,
    name: plan.name,
    description: plan.description,
    billing_type: plan.billingType,
    interval: plan.interval,
    price: plan.price,
    currency_code: plan.currencyCode,
    status: plan.status,
    highlights: plan.highlights,
  };
}

/** Rebuilds the API's shape from the stored columns. `ratingDistribution` is not stored. */
function toListing(
  row: Selectable<ListingsTable>,
  plans: Selectable<ListingPricingPlansTable>[],
): AppListingSummary | AppListing {
  const summary: AppListingSummary = {
    uuid: row.uuid,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    logoUrl: row.logo_url,
    appUrl: row.app_url,
    pricingType: row.pricing_type,
    rating: { average: row.rating_average, count: row.rating_count },
    developer: { name: row.developer_name, handle: row.developer_handle },
  };
  if (!row.detail_fetched_at) return summary;

  return {
    ...summary,
    descriptionTitle: row.description_title ?? "",
    descriptionBody: row.description_body ?? "",
    highlights: row.highlights ?? [],
    heroImageUrl: row.hero_image_url ?? "",
    previewImageUrls: row.preview_image_urls ?? [],
    galleryImageUrls: row.gallery_image_urls ?? [],
    pricingPlans: plans.map((plan) => ({
      uuid: plan.uuid,
      name: plan.name,
      description: plan.description,
      billingType: plan.billing_type,
      interval: plan.interval,
      price: plan.price,
      currencyCode: plan.currency_code,
      status: plan.status,
      highlights: plan.highlights,
    })),
    ratingDistribution: null,
  };
}

function toIssue(finding: Selectable<FindingsTable>): Issue {
  return {
    code: finding.code,
    rule: finding.rule,
    severity: finding.severity,
    message: finding.message,
    ...(finding.field ? { field: finding.field } : {}),
    ...(finding.evidence ? { matched: finding.evidence } : {}),
    ...(finding.related_listing_uuid ? { relatedListingUuid: finding.related_listing_uuid } : {}),
  };
}
