import type { Review, Severity } from "./rules";

/**
 * The index the queue reads: reviews the job wrote, sorted by severity, a page
 * at a time. You design the tables in `db/migrations/`.
 *
 * The types below are a starting point. Change them if your design needs to.
 * A queue row does not need to carry a full listing. If you build decisions, the
 * queue also shows which listings a person already decided.
 */

export type QueueFilter = {
  /** 1-based. */
  page: number;
  size: number;
  /** Worst severity on the listing, or `"none"` for listings every rule passed. */
  severity?: Severity | "none";
  /** A rule number such as `"3.3"`. */
  rule?: string;
};

export type QueuePage = {
  rows: Review[];
  /** Rows matching the filter across every page. */
  total: number;
  page: number;
  size: number;
  /** When the job last wrote, or `null` if it never has. The queue shows this. */
  reviewedAt: string | null;
  /** The revision of `docs/listing-requirements.md` the stored findings came from. */
  ruleRevision: string | null;
};

export type ReviewStore = {
  /** Replaces what is stored for each listing in `reviews`. */
  saveReviews(reviews: Review[], ruleRevision: string): Promise<void>;
  /** One listing's stored review, or `null` if the job has not reached it. */
  getReview(uuid: string): Promise<Review | null>;
  /** Rows matching the filter, most serious first. Rows with the same severity keep submission order. */
  getQueuePage(filter: QueueFilter): Promise<QueuePage>;
};

/**
 * TODO: implement. `getDb()` in `src/lib/db/client.ts` is the Kysely database.
 * Add your tables to `db/schema.ts` so it knows their columns. Two things to
 * know about `pg`: `count(*)` comes back as a string unless you cast it
 * (`count(*)::int`), and a `jsonb` column takes `JSON.stringify(value)`.
 */
export function createReviewStore(): ReviewStore {
  const notImplemented = () => Promise.reject(new Error("the review store is not implemented yet"));
  return {
    saveReviews: notImplemented,
    getReview: notImplemented,
    getQueuePage: notImplemented,
  };
}
