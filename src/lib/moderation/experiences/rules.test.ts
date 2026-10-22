import { describe, expect, it } from "vitest";

import type { FanExperience } from "@/lib/fanvue/experiences";

import { reviewExperiences } from "./rules";

/** An experience that passes every check, to start your tests from. */
const cleanExperience: FanExperience = {
  uuid: "00000000-0000-4000-8000-00000000e1ea",
  externalExperienceId: "clean",
  app: { uuid: "00000000-0000-4000-8000-00000000a1ea", name: "Lenswork" },
  creator: { handle: "mira" },
  title: "Photography 101",
  description: "Six lessons, shot on film. $7 a month.",
  imageUrl: "https://placehold.co/1200x630/png?text=Photography+101",
  experienceType: "VIDEO",
  accessMode: "PAID",
  deliveryMode: "EMBEDDED",
  externalUrl: null,
  hidden: false,
  priceCents: 700,
  priceRecurring: true,
  actions: [],
  publishedAt: "2026-09-14T10:02:00Z",
  updatedAt: "2026-09-14T10:02:00Z",
  activeSubscribers: 10,
  reports: [],
};

/** Findings for one experience on its own. Pass several when a rule compares them. */
const findingsFor = (experience: FanExperience) => reviewExperiences([experience])[0]!.issues;

describe("experience moderation rules", () => {
  it("returns no findings for a clean experience", () => {
    expect(findingsFor(cleanExperience)).toEqual([]);
  });

  // Your tests. `npm run test:watch` reruns them as you save.
  it.todo("flags an experience that breaks the rule you pick");
});
