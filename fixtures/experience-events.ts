import type { ExperienceEvent, FanExperience } from "@/lib/fanvue/experiences";

import { namedExperiences } from "./named-experiences";

/**
 * The event sequence `npm run replay-events` posts to
 * `app/api/moderation/events`, in order. It ends with every experience in the
 * state `named-experiences.ts` shows, which is the state the experience spec
 * is written against. Apart from Private Q&A, each experience has a single
 * publish event carrying its final state, so a few already show a later
 * `updatedAt` or fan reports when they are published.
 *
 * Three things in the sequence are there on purpose:
 *
 * - Private Q&A is published clean, then updated to add the line that breaks
 *   E3. The first review of it finds nothing; the second must.
 * - The second Tip Jar Royale arrives four minutes after the first, from the
 *   same app on the same profile, under a new id. E5 cannot be decided from
 *   either event alone.
 * - `evt-0009`, the second Tip Jar Royale, is delivered twice with the same
 *   `id`. The redelivery must change nothing.
 */

const byKey = new Map(
  namedExperiences.map((experience) => [`${experience.creator.handle}/${experience.externalExperienceId}`, experience]),
);

const experience = (key: string): FanExperience => {
  const found = byKey.get(key);
  if (!found) throw new Error(`no experience ${key} in fixtures/named-experiences.ts`);
  return found;
};

const published = (id: string, key: string): ExperienceEvent => {
  const found = experience(key);
  return { id, type: "experience.published", occurredAt: found.publishedAt, experience: found };
};

const privateQaBeforeUpdate: FanExperience = {
  ...experience("lena/private-qa"),
  description: "Ask me anything, answered on video within 48 hours.",
  updatedAt: experience("lena/private-qa").publishedAt,
};

export const experienceEvents: ExperienceEvent[] = [
  published("evt-0001", "noor/trivia-weekly"),
  published("evt-0002", "rocco/late-night"),
  published("evt-0003", "sam/film-club"),
  published("evt-0004", "mira/course-photography-101"),
  published("evt-0005", "jax/wheel-v2"),
  {
    id: "evt-0006",
    type: "experience.published",
    occurredAt: privateQaBeforeUpdate.publishedAt,
    experience: privateQaBeforeUpdate,
  },
  published("evt-0007", "theo/backstage-pass"),
  published("evt-0008", "mira/tip-jar-royale"),
  published("evt-0009", "mira/tip-jar-royale-2"),
  published("evt-0009", "mira/tip-jar-royale-2"), // delivered twice
  published("evt-0010", "vee/mystery-box"),
  published("evt-0011", "ines/lesson-pack-1"),
  {
    id: "evt-0012",
    type: "experience.updated",
    occurredAt: experience("lena/private-qa").updatedAt,
    experience: experience("lena/private-qa"),
  },
];
