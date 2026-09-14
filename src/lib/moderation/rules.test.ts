import { describe, expect, it } from "vitest";

import type { AppListing } from "@/lib/fanvue/types";

import { reviewListings } from "./rules";

/** A listing that should pass every check. Copy it and break one thing per test. */
const cleanListing: AppListing = {
  uuid: "00000000-0000-4000-8000-00000000c1ea",
  name: "Post Planner",
  tagline: "Plan and schedule your posts in one calendar",
  description: "A weekly content calendar with drag-and-drop scheduling and reminders.",
  logoUrl: "https://placehold.co/256x256/png?text=PP",
  appUrl: "https://postplanner.app",
  pricingType: "monthly",
  rating: { average: 4.5, count: 40 },
  developer: { name: "Quarterlight", handle: "quarterlight" },
  descriptionTitle: "Never miss a posting slot",
  descriptionBody:
    "Post Planner shows your upcoming week at a glance, suggests gaps, and reminds you before each slot.",
  highlights: ["Weekly calendar", "Drag-and-drop scheduling", "Reminders"],
  heroImageUrl: "https://placehold.co/1200x630/png?text=Post+Planner",
  previewImageUrls: [
    "https://placehold.co/800x500/png?text=Preview+1",
    "https://placehold.co/800x500/png?text=Preview+2",
  ],
  galleryImageUrls: ["https://placehold.co/1280x800/png?text=Calendar"],
  pricingPlans: [
    {
      uuid: "00000000-0000-4000-8000-00000000c1eb",
      name: "Pro",
      description: "Unlimited scheduled posts.",
      billingType: "recurring",
      interval: "monthly",
      price: 999,
      currencyCode: "USD",
      status: "active",
      highlights: ["Unlimited posts", "Email reminders"],
    },
  ],
  ratingDistribution: null,
};

/** Findings for one listing on its own. Pass several listings when a rule compares them. */
const findingsFor = (listing: AppListing) => reviewListings([listing])[0]!.issues;

describe("moderation rules", () => {
  it("returns no findings for a clean listing", () => {
    expect(findingsFor(cleanListing)).toEqual([]);
  });

  it("flags a listing with the same screenshot twice (2.3)", () => {
    const padded: AppListing = {
      ...cleanListing,
      previewImageUrls: [cleanListing.previewImageUrls[0]!, cleanListing.previewImageUrls[0]!],
    };

    expect(findingsFor(padded).map((issue) => issue.rule)).toEqual(["2.3"]);
  });

  // Your tests, one or more per rule you add. `npm run test:watch` and see each one fail first.
  // `spec.test.ts` says which listings must end up flagged; these say why.
  it.todo("flags a listing that breaks the next rule you pick");
});
