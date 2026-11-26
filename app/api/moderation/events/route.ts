import type { ListingEventBatch } from "@/lib/fanvue/events";

export const dynamic = "force-dynamic";

/**
 * The webhook. The Fanvue API posts here each time listings are submitted or
 * edited, up to 100 events in a request. Answer with a 2xx once the events are
 * safe with you. Any other answer makes the API send the request again, three
 * times in all.
 *
 * TODO (yours): decide what happens to the events.
 */
export async function POST(request: Request) {
  const { events } = (await request.json()) as ListingEventBatch;
  void events;
  return Response.json({ message: "not implemented" }, { status: 501 });
}
