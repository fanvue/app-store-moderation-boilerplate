import type { FanExperience } from "@/lib/fanvue/experiences";

import { experienceEvents } from "./experience-events";

/**
 * Every experience as it is after the last event in `experience-events.ts`.
 * All apps, creators and URLs are invented.
 */
export const namedExperiences: FanExperience[] = [
  ...new Map(
    experienceEvents.map((event) => [
      `${event.experience.creator.handle}/${event.experience.externalExperienceId}`,
      event.experience,
    ]),
  ).values(),
];
