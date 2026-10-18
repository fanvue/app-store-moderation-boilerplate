import type { ExperienceEvent, FanExperience } from "@/lib/fanvue/experiences";

import { namedExperiences } from "./named-experiences";

/**
 * The event sequence `npm run replay-events` posts to
 * `app/api/moderation/events`, in the order it happened. It ends with every
 * experience in the state `named-experiences.ts` shows, which is the state
 * the experience spec is written against.
 *
 * Each experience is published as it was on the day: no reports, and
 * `updatedAt` equal to `publishedAt`. Later changes arrive as
 * `experience.updated`, and each fan report as `experience.reported`, both
 * carrying the whole experience as it then is. So a review that only runs on
 * publish never sees Late Night Stream cross the E6 bar; the reports arrive
 * five weeks after it went live.
 *
 * Four things in the sequence are there on purpose:
 *
 * - Private Q&A is published clean, then updated to add the line that breaks
 *   E3. The first review of it finds nothing; the second must.
 * - The second Tip Jar Royale arrives four minutes after the first, from the
 *   same app on the same profile, under a new id. E5 cannot be decided from
 *   either event alone.
 * - Spin the Wheel and Trivia Tuesday each get an update that changes
 *   nothing a rule looks at. A no-op update should not produce a second
 *   finding or a second notification.
 * - `evt-0009`, the second Tip Jar Royale's publish, is delivered twice.
 */

const byKey = new Map(
  namedExperiences.map((experience) => [`${experience.creator.handle}/${experience.externalExperienceId}`, experience]),
);

const final = (key: string): FanExperience => {
  const found = byKey.get(key);
  if (!found) throw new Error(`no experience ${key} in fixtures/named-experiences.ts`);
  return found;
};

/** The experience as it was the moment it was published. */
const atPublish = (key: string): FanExperience => {
  const experience = final(key);
  return { ...experience, updatedAt: experience.publishedAt, reports: [] };
};

const published = (id: string, key: string, overrides: Partial<FanExperience> = {}): ExperienceEvent => {
  const experience = { ...atPublish(key), ...overrides };
  return { id, type: "experience.published", occurredAt: experience.publishedAt, experience };
};

/** The final state minus reports, which arrive as their own events. */
const updated = (id: string, key: string): ExperienceEvent => {
  const experience = { ...final(key), reports: [] };
  return { id, type: "experience.updated", occurredAt: experience.updatedAt, experience };
};

/** One event per report, each carrying the reports received so far. */
const reported = (idPrefix: string, key: string): ExperienceEvent[] => {
  const experience = final(key);
  const reports = [...experience.reports].sort((a, b) => a.reportedAt.localeCompare(b.reportedAt));
  return reports.map((report, index) => ({
    id: `${idPrefix}-${index + 1}`,
    type: "experience.reported",
    occurredAt: report.reportedAt,
    experience: { ...experience, reports: reports.slice(0, index + 1) },
  }));
};

const privateQaPublish = published("evt-0006", "lena/private-qa", {
  description: "Ask me anything, answered on video within 48 hours.",
});

const tipJarRoyaleSecondPublish = published("evt-0009", "mira/tip-jar-royale-2");

const unordered: ExperienceEvent[] = [
  published("evt-0001", "noor/trivia-weekly"),
  published("evt-0002", "rocco/late-night"),
  published("evt-0003", "sam/film-club"),
  published("evt-0004", "mira/course-photography-101"),
  published("evt-0005", "jax/wheel-v2"),
  privateQaPublish,
  published("evt-0007", "theo/backstage-pass"),
  published("evt-0008", "mira/tip-jar-royale"),
  tipJarRoyaleSecondPublish,
  published("evt-0010", "vee/mystery-box"),
  published("evt-0011", "ines/lesson-pack-1"),
  updated("evt-0012", "jax/wheel-v2"),
  updated("evt-0013", "noor/trivia-weekly"),
  updated("evt-0014", "lena/private-qa"),
  ...reported("evt-0015", "noor/trivia-weekly"),
  ...reported("evt-0016", "rocco/late-night"),
  ...reported("evt-0017", "vee/mystery-box"),
];

const inOrder = [...unordered].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

/** The sequence, in order, with evt-0009 delivered a second time straight after the first. */
export const experienceEvents: ExperienceEvent[] = inOrder.flatMap((event) =>
  event === tipJarRoyaleSecondPublish ? [event, { ...event }] : [event],
);
