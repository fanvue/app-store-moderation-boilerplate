import type { ExperienceEvent } from "@/lib/fanvue/experiences";
import { reviewEvents } from "@/lib/moderation/experiences/rules";

export const dynamic = "force-dynamic";

/**
 * Where experience events arrive. `npm run replay-events` posts the sequence
 * in `fixtures/experience-events.ts` here, one at a time.
 *
 * Answer `2xx` once the event is safe. For any other answer, the platform
 * retries. Delivery is at least once, so a redelivered event must not produce a
 * second finding, notification or suspension.
 *
 * The README says part two is a discussion; implement this only if you have time.
 */
export async function POST(request: Request) {
  const event = (await request.json()) as ExperienceEvent;
  void event;
  void reviewEvents;
  return Response.json({ message: "not implemented" }, { status: 501 });
}
