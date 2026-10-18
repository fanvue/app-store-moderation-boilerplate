/**
 * The acceptance criteria for the experience rules. Read it, run it, don't edit it.
 *
 *   npm run test:spec
 *
 * Each row below is one of the hand-written experiences in
 * `fixtures/named-experiences.ts`, keyed by creator handle and the app's own
 * id, and the rule sections that must fire for it. An experience with an empty
 * list must come back with no findings at all.
 *
 * As with the listing spec: it says nothing about how to detect anything, how
 * serious anything is, what the finding leads to, or what the message says.
 */
import { describe, expect, it } from "vitest";

import { namedExperiences } from "@fixtures/experiences";

import { reviewExperiences } from "./rules";

const EXPECTED: Record<string, string[]> = {
  "mira/course-photography-101": [],
  "jax/wheel-v2": [],
  "noor/trivia-weekly": [], // one SPAM report is below the E6 bar
  "theo/backstage-pass": ["E1"],
  "ines/lesson-pack-1": ["E2"],
  "lena/private-qa": ["E3"],
  "sam/film-club": ["E4"],
  "mira/tip-jar-royale": ["E5"],
  "mira/tip-jar-royale-2": ["E5"],
  "rocco/late-night": ["E6"],
  "vee/mystery-box": ["E6"],
};

const reviews = reviewExperiences(namedExperiences);

const reviewFor = (key: string) => {
  const review = reviews.find(
    ({ experience }) => `${experience.creator.handle}/${experience.externalExperienceId}` === key,
  );
  if (!review) throw new Error(`no experience ${key} in fixtures/named-experiences.ts`);
  return review;
};

describe("experience moderation spec", () => {
  it.each(Object.entries(EXPECTED))("%s breaks rules %j and nothing else", (key, expected) => {
    const fired = [...new Set(reviewFor(key).issues.map((issue) => issue.rule))].sort();

    expect(fired).toEqual([...expected].sort());
  });

  it("every finding is one a moderator could act on", () => {
    for (const { experience, issues } of reviews) {
      for (const issue of issues) {
        expect(issue.rule, `rule number on ${experience.title}`).toMatch(/^E\d+$/);
        expect(["reject", "fix", "warn"], `severity on ${experience.title}`).toContain(issue.severity);
        expect(issue.message.trim().length, `message on ${issue.code} (${experience.title})`).toBeGreaterThan(0);
        expect(issue.code.trim().length, `code on ${experience.title}`).toBeGreaterThan(0);
      }
    }
  });
});
