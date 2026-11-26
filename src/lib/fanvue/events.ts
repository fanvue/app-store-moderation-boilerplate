/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is part of the mock of the live Fanvue API, which is someone else's system.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

/**
 * What the Fanvue API tells the webhook when a listing is submitted or edited.
 * An event says which listing changed, not what changed: the listing itself
 * comes from `GET /apps/{uuid}`.
 *
 * The same event can arrive twice, in one request or in two, and two events
 * for one listing can arrive in either order. A request that gets no 2xx is
 * sent again, three times in all.
 */
export type ListingEvent = {
  /** Unique per event. A second delivery of the same event repeats it. */
  id: string;
  type: "listing.submitted" | "listing.updated";
  listingUuid: string;
  /** 1 when the listing is first submitted. Goes up by one with each edit. */
  submission: number;
  /** ISO 8601. */
  occurredAt: string;
};

/** The body of one webhook request: up to 100 events. */
export type ListingEventBatch = {
  events: ListingEvent[];
};
