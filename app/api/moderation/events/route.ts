import type { ExperienceEvent } from "@/lib/fanvue/experiences";
import { reviewExperiences } from "@/lib/moderation/experiences/rules";

export const dynamic = "force-dynamic";

/**
 * Where experience events arrive. `npm run replay-events` posts the sequence
 * in `fixtures/experience-events.ts` here, one at a time, the way the
 * platform would.
 *
 * Two things the platform guarantees, and one it does not:
 *
 * - Every event has an `id`, and events for one experience arrive in order.
 * - An `experience.updated` event carries the whole experience as it now is,
 *   not a diff.
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
