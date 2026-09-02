import { describe, expect, it } from "vitest";

import type { AppListing } from "@/lib/fanvue/types";

import { validateListing } from "./rules";

/** A listing that should pass every check. Adjust if a rule legitimately disagrees. */
const cleanListing: AppListing = {
  uuid: "00000000-0000-4000-8000-00000000c1ea",
  name: "Post Planner",
  tagline: "Plan and schedule your posts in one calendar",
  description: "A weekly content calendar with drag-and-drop scheduling and reminders.",
  logoUrl: "https://placehold.co/256x256/png?text=PP",
  appUrl: "https://postplanner.example.com",
  pricingType: "monthly",
  rating: { average: 4.5, count: 40 },
  developer: { name: "Demo Dev", handle: "demo-dev-00" },
  descriptionTitle: "Never miss a posting slot",
  descriptionBody:
    "Post Planner shows your upcoming week at a glance, suggests gaps, and reminds you before each slot.",
  highlights: ["Weekly calendar", "Drag-and-drop scheduling", "Reminders"],
  heroImageUrl: "https://placehold.co/1200x630/png?text=Post+Planner",
  previewImageUrls: [
    "https://placehold.co/800x500/png?text=Preview+1",
    "https://placehold.co/800x500/png?text=Preview+2",
  ],
  galleryImageUrls: [
    "https://placehold.co/1280x800/png?text=Calendar",
    "https://placehold.co/1280x800/png?text=Scheduler",
    "https://placehold.co/1280x800/png?text=Reminders",
  ],
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

describe("validateListing", () => {
  it("returns no findings for a clean listing", () => {
    expect(validateListing(cleanListing)).toEqual([]);
  });

  it.todo("flags a listing that fails a listing-quality requirement");
  it.todo("flags a listing that fails a business or payments requirement");
  it.todo("flags a listing that fails an integration requirement");
});
