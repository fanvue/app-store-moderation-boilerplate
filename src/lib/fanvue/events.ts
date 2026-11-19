/**
 * What the Fanvue API tells the webhook when a listing is submitted or edited.
 * An event says which listing changed, not what changed: the listing itself
 * comes from `GET /apps/{uuid}`.
 *
 * Delivery is at least once. The same event can arrive twice, and two events
 * for one listing can arrive in either order.
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
