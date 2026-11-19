import type { Review, Severity } from "./rules";

/**
 * What the pages read. `npm run measure` calls these two functions as well, to
 * check what is stored, so keep their names and what they return.
 *
 * Everything else is your design: the tables in `db/migrations/`, what writes
 * to them and when, and any functions you add here.
 */

/** One row of the queue. Add the fields your table shows. */
export type QueueRow = {
  uuid: string;
  /** The most serious severity among the listing's findings, or `null` when it has none. */
  severity: Severity | null;
};

export type QueuePage = {
  rows: QueueRow[];
  /** Listings in the queue across every page. */
  total: number;
};

/** The stored review of one listing, or `null` if it is not stored. */
export async function getReview(uuid: string): Promise<Review | null> {
  void uuid;
  throw new Error("getReview is not implemented yet (src/lib/moderation/store.ts)");
}

/** One page of the queue, most serious first. `page` is 1-based. */
export async function getQueuePage(page: number, size: number): Promise<QueuePage> {
  void page;
  void size;
  throw new Error("getQueuePage is not implemented yet (src/lib/moderation/store.ts)");
}
