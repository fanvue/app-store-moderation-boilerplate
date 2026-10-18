import type { Review, Severity } from "./rules";

/**
 * Where reviews live between the job that produces them and the pages that
 * read them.
 *
 * The queue cannot be paginated from the live API: `GET /apps` returns
 * summaries in submission order and knows nothing about severity or rules.
 * Worst-first across pages, filtered by rule, needs an index of findings that
 * is yours. This is that index.
 *
 * Postgres is running (see `src/lib/db/client.ts`); design the tables in
 * `db/migrations/`. A module-scope `Map` would also satisfy this interface,
 * and would be invisible to `npm run review`, which is a different process
 * from `npm run dev`, and empty after every restart. Write the schema and why
 * in `ASSUMPTIONS.md`.
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
  /** Worst first within the filter. Rows with the same worst severity keep submission order. */
  getQueuePage(filter: QueueFilter): Promise<QueuePage>;
};

/**
 * TODO: implement. `getDb()` in `src/lib/db/client.ts` is the pool.
 */
export function createReviewStore(): ReviewStore {
  const notImplemented = () => Promise.reject(new Error("the review store is not implemented yet"));
  return {
    saveReviews: notImplemented,
    getReview: notImplemented,
    getQueuePage: notImplemented,
  };
}
