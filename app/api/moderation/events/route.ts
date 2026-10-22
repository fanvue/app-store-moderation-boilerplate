import type { ExperienceEvent } from "@/lib/fanvue/experiences";
import { reviewExperiences } from "@/lib/moderation/experiences/rules";

export const dynamic = "force-dynamic";

/**
 * Where experience events arrive. `npm run replay-events` posts the sequence
 * in `fixtures/experience-events.ts` here, one at a time.
 *
 * Answer `2xx` once the event is safe; anything else and the platform retries.
 * Delivery is at least once, so a redelivered event must not produce a second
 * finding, notification or takedown. Whether the review runs here or somewhere
 * this enqueues to is the first question in `DESIGN.md`.
 *
 * TODO: implement.
 */
export async function POST(request: Request) {
  const event = (await request.json()) as ExperienceEvent;
  void event;
  void reviewExperiences;
  return Response.json({ message: "not implemented" }, { status: 501 });
}
