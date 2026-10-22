import type { ExperienceEvent, FanExperience } from "@/lib/fanvue/experiences";

import type { Issue } from "../rules";

/** One experience as it is now, and everything the rules found in its history. */
export type ExperienceReview = {
  experience: FanExperience;
  issues: Issue[];
};

/** Experiences are keyed by creator and the app's own id, e.g. `"lena/private-qa"`. */
export const experienceKey = (experience: FanExperience) =>
  `${experience.creator.handle}/${experience.externalExperienceId}`;

/**
 * Reviews an event history, in delivery order, and returns one review per
 * experience with its latest state. `Issue.rule` is a section of
 * `docs/experience-requirements.md`, such as `"E3"`.
 *
 * The rules judge what changed between events, so they need the history, not
 * just the latest state. Pure: no I/O, and the same input always gives the
 * same output.
 *
 * TODO: implement the rules. This version only keeps the latest state.
 */
export function reviewEvents(events: ExperienceEvent[]): ExperienceReview[] {
  const latest = new Map<string, FanExperience>();
  for (const event of events) latest.set(experienceKey(event.experience), event.experience);
  return [...latest.values()].map((experience) => ({ experience, issues: [] }));
}
