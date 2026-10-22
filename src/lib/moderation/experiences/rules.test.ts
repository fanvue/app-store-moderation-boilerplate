import { describe, expect, it } from "vitest";

import type { ExperienceEvent, FanExperience } from "@/lib/fanvue/experiences";

import { reviewEvents } from "./rules";

/** An approved experience that passes every check, to start your tests from. */
const cleanExperience: FanExperience = {
  uuid: "00000000-0000-4000-8000-00000000e1ea",
  externalExperienceId: "clean",
  app: { uuid: "00000000-0000-4000-8000-00000000a1ea", name: "Lenswork" },
  creator: { handle: "mira" },
  title: "Photography 101",
  description: "Six lessons, shot on film.",
  imageUrl: "https://placehold.co/1200x630/png?text=Photography+101",
  experienceType: "VIDEO",
  accessMode: "PAID",
  deliveryMode: "EMBEDDED",
  externalUrl: null,
  hidden: false,
  priceCents: 700,
  priceRecurring: true,
  actions: [],
  reviewStatus: "approved",
  pendingReviewFields: [],
  suspendedAt: null,
  publishedAt: "2026-09-14T10:02:00Z",
  updatedAt: "2026-09-14T10:02:00Z",
  paidImpact: { activeSubscriptionCount: 10, oneTimePurchaseCount: 0 },
  reports: [],
};

/** An `experience.updated` event that applies `change` to `before`. */
const update = (id: string, before: FanExperience, change: Partial<FanExperience>): ExperienceEvent => ({
  id,
  type: "experience.updated",
  occurredAt: "2026-10-01T12:00:00Z",
  experience: { ...before, ...change, updatedAt: "2026-10-01T12:00:00Z" },
});

const published: ExperienceEvent = {
  id: "evt-1",
  type: "experience.published",
  occurredAt: cleanExperience.publishedAt,
  experience: cleanExperience,
};

/** Findings for one experience's history. */
const findingsFor = (events: ExperienceEvent[]) => reviewEvents(events)[0]!.issues;

describe("experience moderation rules", () => {
  it("returns no findings for a clean history", () => {
    expect(findingsFor([published, update("evt-2", cleanExperience, { priceCents: 600 })])).toEqual([]);
  });

  // Your tests. `npm run test:watch` reruns them as you save.
  it.todo("flags an experience that breaks the rule you pick");
});
