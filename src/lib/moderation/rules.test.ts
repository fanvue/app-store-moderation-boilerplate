import { describe, expect, it } from "vitest";

import type { AppListing } from "@/lib/fanvue/types";

import { reviewListings } from "./rules";

/** A listing that passes every check, to start your tests from. */
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

  // Your tests. `npm run test:watch` reruns them as you save.
  // `spec.test.ts` says which listings must be flagged. Your tests say why.

  describe("6.2 valid, owned URL", () => {
    const rulesFor = (appUrl: string | null) =>
      findingsFor({ ...cleanListing, appUrl }).map((issue) => issue.rule);

    it.each([
      ["missing", null],
      ["not https", "http://postplanner.app"],
      ["not a URL at all", "postplanner"],
      ["an IPv4 host", "https://203.0.113.7"],
      ["an IPv6 host", "https://[2001:db8::1]"],
      ["fanvue.com", "https://fanvue.com/apps/post-planner"],
      ["a fanvue.com subdomain", "https://apps.fanvue.com"],
      ["a parking host", "https://parkingcrew.net"],
      ["a site-builder subdomain", "https://postplanner.wixsite.com"],
      ["a godaddysites subdomain", "https://postplanner.godaddysites.com"],
      ["fanvue.com with a trailing dot", "https://fanvue.com."],
      ["a fanvue.com subdomain with a trailing dot", "https://apps.fanvue.com."],
      ["a placeholder subdomain with a trailing dot", "https://postplanner.wixsite.com."],
    ])("flags an appUrl that is %s", (_, appUrl) => {
      expect(rulesFor(appUrl)).toEqual(["6.2"]);
    });

    it.each([
      ["has our name inside another domain", "https://fanvuetools.com"],
      ["ends in fanvue.com without being a subdomain", "https://notfanvue.com"],
      ["has a path and query", "https://postplanner.app/start?ref=store"],
    ])("accepts an appUrl that %s", (_, appUrl) => {
      expect(rulesFor(appUrl)).toEqual([]);
    });
  });

  describe("2.1 production ready", () => {
    it.each([
      ["TODO in the description", { description: "TODO: write this" }],
      ["lorem ipsum in the body", { descriptionBody: "Lorem ipsum dolor sit amet." }],
      ["coming soon in a highlight", { highlights: ["Weekly calendar", "Exports coming soon"] }],
      ["a TBD tagline", { tagline: "tbd" }],
      ["no highlights", { highlights: [] }],
      ["only blank highlights", { highlights: ["  "] }],
    ])("flags %s", (_, overrides) => {
      expect(findingsFor({ ...cleanListing, ...overrides }).map((issue) => issue.rule)).toEqual(["2.1"]);
    });

    it("does not match a marker inside another word", () => {
      expect(findingsFor({ ...cleanListing, description: "Turn todos into posts." })).toEqual([]);
    });
  });

  describe("3.3 pricing accuracy", () => {
    const plan = cleanListing.pricingPlans[0]!;
    const withPlans = (...plans: Partial<typeof plan>[]) =>
      findingsFor({ ...cleanListing, pricingPlans: plans.map((overrides) => ({ ...plan, ...overrides })) });

    it.each([
      ["below $3.99", { price: 398 }],
      ["above $500.00", { price: 50001 }],
      ["in a currency other than USD", { currencyCode: "EUR" }],
      ["pending setup and out of range", { price: 299, status: "pending_setup" as const }],
    ])("flags a plan priced %s", (_, overrides) => {
      expect(withPlans(overrides).map((issue) => issue.rule)).toEqual(["3.3"]);
    });

    it.each([
      ["$3.99", 399],
      ["$500.00", 50000],
    ])("accepts a plan at exactly %s", (_, price) => {
      expect(withPlans({ price })).toEqual([]);
    });

    it("ignores a withdrawn plan out of range", () => {
      expect(withPlans({}, { price: 65000, status: "withdrawn" })).toEqual([]);
    });

    it("flags copy that advertises a free plan the listing does not have", () => {
      const advertised = { ...cleanListing, descriptionBody: "Start on the Free Forever tier." };

      expect(findingsFor(advertised).map((issue) => issue.rule)).toEqual(["3.3"]);
    });

    it("accepts advertised free copy when a free plan exists", () => {
      const freePlan = { ...plan, billingType: "free" as const, interval: null, price: 0 };
      const advertised = {
        ...cleanListing,
        tagline: "Free to start",
        pricingPlans: [freePlan, plan],
      };

      expect(findingsFor(advertised)).toEqual([]);
    });

    it("does not count a withdrawn free plan", () => {
      const freePlan = { ...plan, billingType: "free" as const, interval: null, price: 0, status: "withdrawn" as const };
      const advertised = { ...cleanListing, tagline: "Free plan included", pricingPlans: [freePlan, plan] };

      expect(findingsFor(advertised).map((issue) => issue.rule)).toEqual(["3.3"]);
    });
  });

  describe("1.6 no promotion of other platforms", () => {
    it.each([
      ["the plain name", "Works with OnlyFans"],
      ["digits for letters", "Grow your 0nlyFans"],
      ["a digit inside Fansly", "Built for Fans1y creators"],
      ["a dot separator", "Post to only.fans"],
      ["a hyphen inside a name", "Post to fans-ly"],
      ["a spaced name in title case", "Post to Only Fans"],
      ["unusual casing", "Post to oNlYfAnS"],
      ["Patreon", "Import your Patreon tiers"],
      ["a spaced name in capitals", "Post to JUST FOR FANS"],
    ])("flags %s", (_, tagline) => {
      expect(findingsFor({ ...cleanListing, tagline }).map((issue) => issue.rule)).toEqual(["1.6"]);
    });

    it.each([
      ["the only fans who tip", "Rewards for the only fans who tip"],
      ["a sentence that starts with Only", "Only fans who opt in get reminders"],
      ["loyal fans", "Thank your loyal fans"],
      ["just for fans", "Bonus posts made just for fans"],
    ])("accepts ordinary English: %s", (_, tagline) => {
      expect(findingsFor({ ...cleanListing, tagline })).toEqual([]);
    });

    it("shows the reviewer what was matched", () => {
      const [issue] = findingsFor({ ...cleanListing, highlights: ["Cross-post to Only.Fans"] });

      expect(issue).toMatchObject({ rule: "1.6", field: "highlights[0]", matched: "Only.Fans" });
    });
  });

  describe("4.2 originality", () => {
    const copy = {
      description: "An inbox assistant that drafts replies and sorts fans by spend.",
      descriptionBody:
        "Post Planner turns your inbox into a workflow: it drafts replies in your voice and surfaces the conversations most likely to convert.",
    };
    const original: AppListing = { ...cleanListing, ...copy };
    const renamed: AppListing = {
      ...cleanListing,
      ...copy,
      uuid: "00000000-0000-4000-8000-00000000c1ec",
      name: "Inbox Pilot",
      developer: { name: "Someone Else", handle: "someoneelse" },
      descriptionBody: copy.descriptionBody.replace("Post Planner", "Inbox Pilot").toUpperCase(),
    };
    const rulesForEach = (listings: AppListing[]) =>
      reviewListings(listings).map((review) => review.issues.map((issue) => issue.rule));

    it("flags both listings when another developer resubmits the copy under a new name", () => {
      expect(rulesForEach([original, renamed])).toEqual([["4.2"], ["4.2"]]);
    });

    it("names the other listing in the finding", () => {
      const [first] = reviewListings([original, renamed]);

      expect(first!.issues[0]).toMatchObject({ relatedListingUuid: renamed.uuid });
    });

    it("never matches two listings from the same developer", () => {
      const sameDeveloper = { ...renamed, developer: original.developer };

      expect(rulesForEach([original, sameDeveloper])).toEqual([[], []]);
    });

    it("does not match unrelated descriptions", () => {
      expect(rulesForEach([cleanListing, renamed])).toEqual([[], []]);
    });
  });
});
