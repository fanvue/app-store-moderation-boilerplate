import type { ListingEvent, ListingEventBatch } from "./events";
import { currentListings, currentSubmission, saveEdit } from "./mock-state";
import type { AppListing } from "./types";

/**
 * Stands in for the developers and for the Fanvue API's webhook sender: it
 * edits listings and delivers the events. `npm run send-events` and
 * `npm run measure` use it.
 *
 * Mock internals. The moderation tool does not import this file.
 */

export const WEBHOOK_URL = process.env.MODERATION_WEBHOOK_URL ?? "http://localhost:3000/api/moderation/events";

const eventFor = (type: ListingEvent["type"], listingUuid: string, submission: number): ListingEvent => ({
  id: `evt_${listingUuid}_${submission}`,
  type,
  listingUuid,
  submission,
  occurredAt: new Date().toISOString(),
});

/** One `listing.submitted` event per listing, as if every listing had just been submitted. */
export function submittedEvents(): ListingEvent[] {
  return currentListings().map((listing) =>
    eventFor("listing.submitted", listing.uuid, currentSubmission(listing.uuid)),
  );
}

/** Changes fields on a listing, as a developer would, and returns the event the API sends for it. */
export function editListing(uuid: string, change: Partial<AppListing>): ListingEvent {
  const listing = currentListings().find((candidate) => candidate.uuid === uuid);
  if (!listing) throw new Error(`no listing ${uuid}`);
  return eventFor("listing.updated", uuid, saveEdit(uuid, { ...listing, ...change, uuid }));
}

/** Puts a listing back to its original copy. That is an edit too, so it returns an event. */
export function restoreListing(uuid: string): ListingEvent {
  return eventFor("listing.updated", uuid, saveEdit(uuid, null));
}

/** The most events the API puts in one webhook request. */
export const MAX_EVENTS_PER_REQUEST = 100;

export type DeliveryReport = {
  /** Distinct events. */
  events: number;
  /** Webhook requests made. */
  requests: number;
  /** Events the webhook never answered with a 2xx. */
  failed: number;
  /** What the first failure said, to show the person running the script. */
  firstFailure: string | null;
  slowestMs: number;
};

export type DeliveryOptions = {
  /** Deliver every nth event a second time. 0 for never. Default 10. */
  duplicateEvery?: number;
  /** Deliver in a mixed-up order. Default true. */
  shuffle?: boolean;
  /** Requests in flight at once. Default 4. */
  concurrency?: number;
  /** Where to post. Default {@link WEBHOOK_URL}. */
  url?: string;
};

/** A small seeded generator, so the mixed-up order is the same on every run. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

async function post(url: string, events: ListingEvent[]): Promise<{ ok: boolean; ms: number; problem: string | null }> {
  const started = performance.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ events } satisfies ListingEventBatch),
      signal: AbortSignal.timeout(30_000),
    });
    const ms = performance.now() - started;
    return { ok: response.ok, ms, problem: response.ok ? null : `the webhook answered ${response.status}` };
  } catch (error) {
    const cause = error instanceof Error ? (error.cause instanceof Error ? error.cause.message : error.message) : "";
    return { ok: false, ms: performance.now() - started, problem: `the webhook did not answer (${cause})` };
  }
}

/**
 * Posts the events to the webhook the way the live sender does: up to 100 in
 * a request, several requests at once, some events twice, not in order. A
 * request that gets no 2xx is sent twice more.
 */
export async function deliverEvents(events: ListingEvent[], options: DeliveryOptions = {}): Promise<DeliveryReport> {
  const { duplicateEvery = 10, shuffle = true, concurrency = 4, url = WEBHOOK_URL } = options;

  const deliveries = [...events];
  if (duplicateEvery > 0) {
    events.forEach((event, index) => {
      if (index % duplicateEvery === 0) deliveries.push(event);
    });
  }
  if (shuffle) {
    const random = seeded(deliveries.length);
    for (let index = deliveries.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [deliveries[index], deliveries[other]] = [deliveries[other]!, deliveries[index]!];
    }
  }

  const requests: ListingEvent[][] = [];
  for (let start = 0; start < deliveries.length; start += MAX_EVENTS_PER_REQUEST) {
    requests.push(deliveries.slice(start, start + MAX_EVENTS_PER_REQUEST));
  }

  const report: DeliveryReport = { events: events.length, requests: 0, failed: 0, firstFailure: null, slowestMs: 0 };
  const delivered = new Set<string>();
  let nobodyListening = false;

  let next = 0;
  const sender = async () => {
    while (next < requests.length && !nobodyListening) {
      const batch = requests[next]!;
      next += 1;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const { ok, ms, problem } = await post(url, batch);
        report.requests += 1;
        report.slowestMs = Math.max(report.slowestMs, Math.round(ms));
        if (ok) {
          for (const event of batch) delivered.add(event.id);
          break;
        }
        report.firstFailure ??= problem;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 200));
      }
      // Stop when the first request was never accepted, rather than fail them all.
      if (delivered.size === 0) nobodyListening = true;
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, requests.length) }, sender));

  report.failed = events.filter((event) => !delivered.has(event.id)).length;
  return report;
}
