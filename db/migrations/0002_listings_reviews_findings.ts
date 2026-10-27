import { type Kysely, sql } from "kysely";

// What the job fetched (`listings`, `listing_pricing_plans`) and what the rules
// derived from it (`reviews`, `findings`), kept apart because they change at
// different times: one edit replaces one listing, but through 4.2 it can change
// several listings' reviews. A listing with no `reviews` row is "not reviewed yet".

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("listings")
    .addColumn("uuid", "uuid", (col) => col.primaryKey())
    // Ours, not the API's: set when the job first sees a listing, moved to the
    // end when its worst severity changes.
    .addColumn("position", "integer", (col) => col.notNull().unique())
    // From GET /apps.
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("tagline", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("logo_url", "text", (col) => col.notNull())
    .addColumn("app_url", "text")
    .addColumn("pricing_type", "text", (col) => col.notNull().check(sql`pricing_type in ('free', 'monthly')`))
    .addColumn("rating_average", "double precision")
    .addColumn("rating_count", "integer")
    .addColumn("developer_name", "text")
    .addColumn("developer_handle", "text")
    // From GET /apps/{uuid}. Null until the detail call.
    .addColumn("description_title", "text")
    .addColumn("description_body", "text")
    .addColumn("highlights", sql`text[]`)
    .addColumn("hero_image_url", "text")
    .addColumn("preview_image_urls", sql`text[]`)
    .addColumn("gallery_image_urls", sql`text[]`)
    .addColumn("fetched_at", "timestamptz", (col) => col.notNull())
    .addColumn("detail_fetched_at", "timestamptz")
    .execute();

  await db.schema
    .createTable("listing_pricing_plans")
    .addColumn("uuid", "uuid", (col) => col.primaryKey())
    .addColumn("listing_uuid", "uuid", (col) => col.notNull().references("listings.uuid").onDelete("cascade"))
    // The plan's index in `pricingPlans`, so a finding's `pricingPlans[n]` stays true.
    .addColumn("sort_order", "smallint", (col) => col.notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("billing_type", "text", (col) =>
      col.notNull().check(sql`billing_type in ('free', 'one_time', 'recurring')`),
    )
    .addColumn("interval", "text", (col) => col.check(sql`"interval" in ('monthly', 'yearly')`))
    // Minor units of `currency_code`.
    .addColumn("price", "integer", (col) => col.notNull())
    .addColumn("currency_code", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().check(sql`status in ('pending_setup', 'active', 'withdrawn')`))
    .addColumn("highlights", sql`text[]`, (col) => col.notNull())
    .addUniqueConstraint("listing_pricing_plans_listing_order", ["listing_uuid", "sort_order"])
    .execute();

  await db.schema
    .createTable("reviews")
    .addColumn("listing_uuid", "uuid", (col) => col.primaryKey().references("listings.uuid").onDelete("cascade"))
    .addColumn("run_id", "bigint", (col) => col.notNull().references("review_runs.id"))
    .addColumn("rule_revision", "text", (col) => col.notNull())
    // 0 reject, 1 fix, 2 warn, 3 no findings. The queue sorts on it.
    .addColumn("severity_rank", "smallint", (col) => col.notNull().check(sql`severity_rank between 0 and 3`))
    .addColumn("reviewed_at", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("findings")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("listing_uuid", "uuid", (col) => col.notNull().references("reviews.listing_uuid").onDelete("cascade"))
    .addColumn("code", "text", (col) => col.notNull())
    .addColumn("rule", "text", (col) => col.notNull())
    .addColumn("severity", "text", (col) => col.notNull().check(sql`severity in ('reject', 'fix', 'warn')`))
    .addColumn("message", "text", (col) => col.notNull())
    .addColumn("field", "text")
    // The text that triggered the finding.
    .addColumn("evidence", "text")
    // The other listing in a 4.2 pair.
    .addColumn("related_listing_uuid", "uuid", (col) => col.references("listings.uuid").onDelete("set null"))
    .execute();

  await db.schema.createIndex("reviews_severity_rank").on("reviews").column("severity_rank").execute();
  await db.schema.createIndex("findings_listing").on("findings").column("listing_uuid").execute();
  await db.schema.createIndex("findings_rule").on("findings").column("rule").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("findings").execute();
  await db.schema.dropTable("reviews").execute();
  await db.schema.dropTable("listing_pricing_plans").execute();
  await db.schema.dropTable("listings").execute();
}
