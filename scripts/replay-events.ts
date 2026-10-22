/**
 * Posts the experience events in `fixtures/experience-events.ts` to the dev
 * server, in order, and prints what came back.
 *
 *   npm run dev            # in one terminal
 *   npm run replay-events  # in another
 *
 * One event is sent twice on purpose. Both deliveries should get a 2xx and
 * only one of them should have any effect.
 */
import { experienceEvents } from "@fixtures/experience-events";

const base = process.env.MODERATION_BASE_URL ?? "http://localhost:3000";

async function main() {
  let accepted = 0;
  const statuses = new Set<number>();
  for (const event of experienceEvents) {
    const key = `${event.experience.creator.handle}/${event.experience.externalExperienceId}`;
    const response = await fetch(`${base}/api/moderation/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(30_000),
    });
    statuses.add(response.status);
    if (response.ok) accepted += 1;
    console.log(`${response.status}  ${event.id}  ${event.type.padEnd(21)} ${key}`);
  }
  console.log(`\n${accepted} of ${experienceEvents.length} accepted`);
  if (statuses.has(501)) console.log("501 means app/api/moderation/events/route.ts is not implemented yet");
}

main().catch((error) => {
  const cause = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
  console.error(`${error instanceof Error ? error.message : error}${cause}`);
  console.error(`Is npm run dev running at ${base}?`);
  process.exit(1);
});
