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

  it("rejects a listing with fewer than two screenshots", () => {
    expect(codes({ ...cleanListing, previewImageUrls: [cleanListing.previewImageUrls[0]!] })).toContain(
      "too_few_screenshots",
    );
  });

  it("rejects a missing, invalid, insecure, or Fanvue-hosted app URL", () => {
    expect(codes({ ...cleanListing, appUrl: null })).toContain("missing_app_url");
    expect(codes({ ...cleanListing, appUrl: "not a URL" })).toContain("invalid_app_url");
    expect(codes({ ...cleanListing, appUrl: "http://postplanner.example.com" })).toContain("app_url_not_https");
    expect(codes({ ...cleanListing, appUrl: "https://studio.fanvue.com/app" })).toContain("app_url_uses_fanvue_domain");
  });

  it("flags paid USD plans outside the supported price range", () => {
    const [plan] = cleanListing.pricingPlans;

    expect(codes({ ...cleanListing, pricingPlans: [{ ...plan!, price: 50_001 }] })).toContain(
      "paid_plan_price_out_of_range",
    );
  });

  it("flags paid plans that are not recurring monthly subscriptions", () => {
    const [plan] = cleanListing.pricingPlans;

    expect(codes({ ...cleanListing, pricingPlans: [{ ...plan!, billingType: "one_time", interval: null }] })).toContain(
      "paid_plan_not_monthly",
    );
  });

  it("flags plan names and highlight lists that exceed their limits", () => {
    const [plan] = cleanListing.pricingPlans;
    const issues = codes({
      ...cleanListing,
      pricingPlans: [
        {
          ...plan!,
          name: "A plan name longer than twenty",
          highlights: ["One", "Two", "Three", "Four", "Five", "Six"],
        },
      ],
    });

    expect(issues).toEqual(expect.arrayContaining(["plan_name_too_long", "too_many_plan_highlights"]));
  });

  it("warns when copy promotes a competing creator platform", () => {
    expect(codes({ ...cleanListing, tagline: "Grow your 0nlyFans faster" })).toContain("competitor_platform_promotion");
  });

  it("warns when copy refers to an external payment provider", () => {
    expect(codes({ ...cleanListing, highlights: ["Upgrade through our Stripe checkout"] })).toContain(
      "external_payment_promotion",
    );
    expect(codes({ ...cleanListing, highlights: ["Buy through our payment link"] })).toContain(
      "external_payment_promotion",
    );
  });

  it("warns when the pricing type does not match the available plans", () => {
    expect(codes({ ...cleanListing, pricingType: "free" })).toContain("pricing_type_does_not_match_plans");
  });

  it("warns when listing copy contains placeholder text", () => {
    expect(codes({ ...cleanListing, descriptionBody: "Lorem ipsum TODO" })).toContain("placeholder_listing_copy");
  });

  it("warns when listing copy has multiple Spanish-language signals", () => {
    expect(
      codes({
        ...cleanListing,
        description: "Organiza tu biblioteca de contenido en carpetas inteligentes.",
      }),
    ).toContain("listing_may_not_be_english");
  });
});

function codes(listing: AppListing): string[] {
  return validateListing(listing).map((issue) => issue.code);
}
