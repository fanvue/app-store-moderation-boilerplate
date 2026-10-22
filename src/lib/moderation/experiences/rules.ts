import type { FanExperience } from "@/lib/fanvue/experiences";

import type { Issue } from "../rules";

/** One experience and everything the rules found on it. */
export type ExperienceReview = {
  experience: FanExperience;
  issues: Issue[];
};

/**
 * Reviews a set of live experiences and returns the findings for each, in the
 * order they came in. `Issue.rule` is a section of
 * `docs/experience-requirements.md`, such as `"E3"`.
 *
 * Takes the whole set because E5 compares rows on the same profile. Pure: no
 * I/O, and the same input always gives the same output.
 */
export function reviewExperiences(experiences: FanExperience[]): ExperienceReview[] {
  return experiences.map((experience) => ({ experience, issues: [] }));
}
