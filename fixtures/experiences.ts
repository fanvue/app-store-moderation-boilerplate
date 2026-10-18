import type { FanExperience } from "@/lib/fanvue/experiences";

import { namedExperiences } from "./named-experiences";

export { namedExperiences } from "./named-experiences";

/**
 * Every experience the mock feed serves. There is no generated bulk here: the
 * experience part of the exercise is about where the review runs and what it
 * may do, not about clearing a backlog.
 *
 * `src/lib/moderation/experiences/spec.test.ts` is written against `namedExperiences`.
 */
export const experiences: FanExperience[] = [...namedExperiences];
