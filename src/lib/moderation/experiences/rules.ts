import type { FanExperience } from "@/lib/fanvue/experiences";

import type { Issue } from "../rules";

/** One experience and everything the rules found on it. */
export type ExperienceReview = {
  experience: FanExperience;
  issues: Issue[];
};

/**
 * Reviews a set of live experiences and returns the findings for each, in the
 * order they came in.
 *
 * `Issue.rule` is a section of `docs/experience-requirements.md`: `"E1"`,
 * `"E3"`. Same `Issue` type as the listings, so one queue can carry both; if
 * the severity vocabulary does not fit experiences, say so in `DESIGN.md`.
 *
 * Takes the whole set because E5 compares rows on the same profile. Pure: no
 * I/O, and the same input always gives the same output. Where it runs, and
 * what happens to a finding afterwards, is the design question in part two of
 * the README.
 */
export function reviewExperiences(experiences: FanExperience[]): ExperienceReview[] {
  return experiences.map((experience) => ({ experience, issues: [] }));
}
