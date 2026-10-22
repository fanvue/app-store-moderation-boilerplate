import type { FanExperience } from "@/lib/fanvue/experiences";

import { namedExperiences } from "./named-experiences";

export { namedExperiences } from "./named-experiences";

/**
 * Every experience the mock feed serves.
 *
 * `src/lib/moderation/experiences/spec.test.ts` is written against `namedExperiences`.
 */
export const experiences: FanExperience[] = [...namedExperiences];
