/**
 * Acceptance criteria for the experience rules (part two). Do not edit.
 *
 *   npm run test:spec:experiences
 *
 * Replays the event history in `fixtures/experience-events.ts`. Each row is an
 * experience, keyed by creator handle and the app's own id, and the rules that
 * must flag it. An empty list means no findings.
 */
import { describe, expect, it } from "vitest";

import { experienceEvents } from "@fixtures/experience-events";

import { experienceKey, reviewEvents } from "./rules";

const EXPECTED: Record<string, string[]> = {
  "mira/course-photography-101": [], // price lowered for paying fans
  "sam/film-club": ["E5"],
  "kit/zine-club": [], // price raised, but nobody has paid yet
  "lena/private-qa": ["E1"],
  "vee/mystery-box": ["E1", "E4"],
  "theo/backstage-pass": ["E2"],
  "ines/lesson-pack-1": [], // cover changed before the first approval
  "dex/after-hours": ["E3"],
  "nico/gym-live": ["E3"],
  "rocco/late-night": ["E4"],
  "noor/trivia-weekly": [], // four reports from three fans, never three different fans within 7 days
  "jax/wheel-v2": [], // an update that changes nothing a rule reads
};

const reviews = reviewEvents(experienceEvents);

const reviewFor = (key: string) => {
  const review = reviews.find(({ experience }) => experienceKey(experience) === key);
  if (!review) throw new Error(`no review for ${key}`);
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

  it("delivering every event twice changes nothing", () => {
    const twice = experienceEvents.flatMap((event) => [event, structuredClone(event)]);

    expect(reviewEvents(twice)).toEqual(reviews);
  });
});
