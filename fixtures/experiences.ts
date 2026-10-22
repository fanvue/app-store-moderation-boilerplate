import type { FanExperience } from "@/lib/fanvue/experiences";

import { namedExperiences } from "./named-experiences";

export { namedExperiences } from "./named-experiences";

/**
 * Every experience the mock backfill serves: each one as it is after the last
 * event in `experience-events.ts`.
 */
export const experiences: FanExperience[] = [...namedExperiences];
