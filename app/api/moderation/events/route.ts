import type { ExperienceEvent } from "@/lib/fanvue/experiences";
import { reviewExperiences } from "@/lib/moderation/experiences/rules";

export const dynamic = "force-dynamic";

/**
 * Where experience events arrive. `npm run replay-events` posts the sequence
 * in `fixtures/experience-events.ts` here, one at a time, the way the
 * platform would.
 *
 * Three kinds of event: `experience.published`, `experience.updated` and
 * `experience.reported`. Each carries the whole experience as it is at that
 * moment, reports included, not a diff. Two things the platform guarantees,
 * and one it does not:
 *
 * - Every event has an `id`, and events for one experience arrive in order.
 * - A report arrives as its own event. E6 is decided from reports, so a
 *   review that only runs on publish never sees it.
 * - Delivery is at least once. The same event can arrive twice. The replay
 *   sends one twice on purpose.
 *
 * Answer `2xx` once the event is safe; anything else and the platform retries.
 * Whether the review runs inside this handler or somewhere this handler only
 * enqueues to is the first question in `DESIGN.md`. Either way, the second
 * delivery of an event must not produce a second finding, a second
 * notification or a second takedown.
 *
 * TODO: implement.
 */
export async function POST(request: Request) {
  const event = (await request.json()) as ExperienceEvent;
  void event;
  void reviewExperiences;
  return Response.json({ message: "not implemented" }, { status: 501 });
}
