import { describe, expect, it } from "vitest";

import type { AppListing } from "@/lib/fanvue/types";

import { reviewListings } from "./rules";

/** A listing that passes every check. */
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

/** The rules that fired on one listing, without repeats. */
const rulesFor = (listing: AppListing) => [...new Set(findingsFor(listing).map((issue) => issue.rule))];

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

  describe("1.6 no promotion of other platforms", () => {
    it.each([
      ["a plain name", "Cross-post to OnlyFans in one click", "OnlyFans"],
      ["digits for letters", "Grow your 0nlyFans faster", "0nlyFans"],
      ["a digit inside the name", "Move over from Fans1y", "Fans1y"],
      ["a dot between the words", "Popular destinations include Only.Fans", "Only.Fans"],
      ["a hyphen inside the name", "Works with fans-ly too", "fans-ly"],
      ["a spaced name, capitalised", "For creators moving over from Only Fans", "Only Fans"],
      ["unusual casing", "Built for pAtReOn supporters", "pAtReOn"],
      ["a three-word name", "Bring your Just.For.Fans audience", "Just.For.Fans"],
    ])("flags %s", (_case, tagline, matched) => {
      const [issue] = findingsFor({ ...cleanListing, tagline });

      expect(issue).toMatchObject({ rule: "1.6", field: "tagline", evidence: matched });
    });

    it.each([
      "Rewards for the only fans who tip",
      "the only fans you need to message",
      "Only fans who opted in get the newsletter",
      "Many vids, one library",
    ])("does not flag ordinary English: %s", (tagline) => {
      expect(findingsFor({ ...cleanListing, tagline })).toEqual([]);
    });

    it("reads every field a user sees before opening the app", () => {
      const listing = { ...cleanListing, highlights: ["Calendar", "Imports from ManyVids"] };

      expect(findingsFor(listing)).toMatchObject([{ rule: "1.6", field: "highlights[1]", evidence: "ManyVids" }]);
    });

    it("does not read the URL or the plans, which the rule does not cover", () => {
      const listing = { ...cleanListing, appUrl: "https://onlyfans-tools.app" };

      expect(findingsFor(listing)).toEqual([]);
    });
  });

  describe("2.1 production ready", () => {
    it.each(["lorem", "Ipsum", "TODO", "TBD", "FIXME", "Coming soon", "placeholder", "Sample text"])(
      "flags the marker %s",
      (marker) => {
        const listing = { ...cleanListing, descriptionBody: `${marker}: rewrite before launch.` };

        expect(findingsFor(listing)).toMatchObject([{ rule: "2.1", code: "draft_copy", field: "descriptionBody" }]);
      },
    );

    it.each([
      "A todo list for creators.",
      "Placeholders swapped for your own photos.",
      "Upcoming soon-to-expire offers.",
    ])("does not flag ordinary copy: %s", (descriptionBody) => {
      expect(rulesFor({ ...cleanListing, descriptionBody })).toEqual([]);
    });

    it("flags draft copy left on a plan", () => {
      const listing = {
        ...cleanListing,
        pricingPlans: [{ ...cleanListing.pricingPlans[0]!, description: "TBD" }],
      };

      expect(findingsFor(listing)).toMatchObject([{ rule: "2.1", field: "pricingPlans[0].description" }]);
    });

    it("flags a listing with no highlights", () => {
      expect(findingsFor({ ...cleanListing, highlights: [] })).toMatchObject([
        { rule: "2.1", code: "no_highlights", field: "highlights" },
      ]);
    });

    it("gives one finding per field, naming every marker in it", () => {
      const listing = { ...cleanListing, descriptionBody: "TODO: replace the lorem ipsum." };
      const [issue, ...rest] = findingsFor(listing);

      expect(rest).toEqual([]);
      expect(issue!.message).toContain('"TODO", "lorem", "ipsum"');
    });
  });

  describe("3.3 pricing accuracy", () => {
    const plan = cleanListing.pricingPlans[0]!;
    const withPlans = (...pricingPlans: AppListing["pricingPlans"]) => ({ ...cleanListing, pricingPlans });

    it.each([
      ["below the floor", 299],
      ["above the ceiling", 50001],
    ])("flags a USD plan %s", (_case, price) => {
      expect(findingsFor(withPlans({ ...plan, price }))).toMatchObject([
        { rule: "3.3", code: "price_out_of_range", field: "pricingPlans[0].price" },
      ]);
    });

    it.each([399, 50000])("accepts the edge of the range, %i cents", (price) => {
      expect(findingsFor(withPlans({ ...plan, price }))).toEqual([]);
    });

    it("flags a plan in another currency without converting it", () => {
      const [issue] = findingsFor(withPlans({ ...plan, currencyCode: "EUR", price: 999 }));

      expect(issue).toMatchObject({ rule: "3.3", code: "price_currency_unverifiable", severity: "warn" });
    });

    it("does not check a withdrawn plan, which nobody can buy", () => {
      expect(findingsFor(withPlans(plan, { ...plan, uuid: "withdrawn", price: 65000, status: "withdrawn" }))).toEqual(
        [],
      );
    });

    it("checks a plan pending setup, which goes live on approval", () => {
      expect(rulesFor(withPlans(plan, { ...plan, uuid: "pending", price: 65000, status: "pending_setup" }))).toEqual([
        "3.3",
      ]);
    });

    it.each(["free plan", "Free tier", "free forever", "free to start", "free-to-start"])(
      "flags a free claim with no free plan: %s",
      (claim) => {
        expect(findingsFor({ ...cleanListing, descriptionBody: `Start on the ${claim}.` })).toMatchObject([
          { rule: "3.3", code: "free_plan_missing" },
        ]);
      },
    );

    it("accepts a free claim when a free plan exists", () => {
      const free = { ...plan, uuid: "free", billingType: "free" as const, interval: null, price: 0 };

      expect(findingsFor({ ...withPlans(plan, free), descriptionBody: "Start on the free tier." })).toEqual([]);
    });

    it("does not treat other uses of free as a claim", () => {
      expect(findingsFor({ ...cleanListing, descriptionBody: "Feel free to cancel. Ad-free." })).toEqual([]);
    });
  });

  describe("6.2 valid, owned URL", () => {
    const codeFor = (appUrl: string | null) => findingsFor({ ...cleanListing, appUrl }).map((issue) => issue.code);

    it.each([
      [null, "app_url_missing"],
      ["   ", "app_url_missing"],
      ["not a url", "app_url_invalid"],
      ["http://postplanner.app", "app_url_not_https"],
      ["https://192.168.1.20/app", "app_url_ip_host"],
      ["https://0x7f.1", "app_url_ip_host"],
      ["https://[::1]/", "app_url_ip_host"],
      ["https://fanvue.com/apps/planner", "app_url_on_fanvue"],
      ["https://planner.FANVUE.com", "app_url_on_fanvue"],
      ["https://fanvue.com./", "app_url_on_fanvue"],
      ["https://planner.parkingcrew.net", "app_url_placeholder_host"],
      ["https://sedoparking.com/postplanner", "app_url_placeholder_host"],
      ["https://myapp.wixsite.com/planner", "app_url_placeholder_host"],
      ["http://linkpulse.parkingcrew.net", "app_url_placeholder_host"],
    ])("flags %s as %s", (appUrl, code) => {
      expect(codeFor(appUrl)).toEqual([code]);
    });

    it.each([
      "https://copilot-fanvue-tools.com",
      "https://notfanvue.com",
      "https://fanvue.com.example.org",
      "https://app.planner.io:8443/start",
    ])("accepts %s", (appUrl) => {
      expect(codeFor(appUrl)).toEqual([]);
    });
  });

  describe("4.2 originality", () => {
    const template: AppListing = {
      ...cleanListing,
      uuid: "00000000-0000-4000-8000-0000000000a1",
      name: "Inbox Ace",
      developer: { name: "Ace Labs", handle: "acelabs" },
      description: "An inbox assistant that drafts replies, sorts fans by spend and flags the chats worth your time.",
      descriptionBody:
        "Inbox Ace turns your inbox into a workflow: it drafts replies in your voice and surfaces the conversations most likely to convert this week.",
    };
    const resubmitted: AppListing = {
      ...template,
      uuid: "00000000-0000-4000-8000-0000000000b2",
      name: "Reply Pilot",
      developer: { name: "Pilot Apps", handle: "pilotapps" },
      description: template.description.toUpperCase(),
      descriptionBody: template.descriptionBody.replace("Inbox Ace", "Reply Pilot").replaceAll(",", ";"),
    };

    it("flags both listings, each pointing at the other", () => {
      const [first, second] = reviewListings([template, resubmitted]);

      expect(first!.issues).toMatchObject([{ rule: "4.2", relatedListingUuid: resubmitted.uuid }]);
      expect(second!.issues).toMatchObject([{ rule: "4.2", relatedListingUuid: template.uuid }]);
    });

    it("ignores case, punctuation and the app's own name, and quotes what matched", () => {
      const [issue] = reviewListings([template, resubmitted])[0]!.issues;

      expect(issue!.message).toContain("100% the same");
      expect(issue!.evidence).toContain("turns your inbox into a workflow");
    });

    it("does not compare listings from the same developer", () => {
      const sibling = { ...resubmitted, developer: template.developer };

      expect(reviewListings([template, sibling]).flatMap((review) => review.issues)).toEqual([]);
    });

    it("does not flag listings that only share a few phrases", () => {
      const different = {
        ...resubmitted,
        description: "Schedules posts and drafts replies in your voice.",
        descriptionBody: "Reply Pilot plans your week and reminds you before each slot.",
      };

      expect(reviewListings([template, different]).flatMap((review) => review.issues)).toEqual([]);
    });

    it("finds a pair among many unrelated listings, and nothing else", () => {
      const store = [
        template,
        ...Array.from({ length: 50 }, (_unused, index) => ({
          ...cleanListing,
          uuid: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
          developer: { name: `Dev ${index}`, handle: `dev${index}` },
          description: `Tool number ${index} for creators who post ${index} times a week.`,
          descriptionBody: `Every listing shares this sentence about scheduling. Tool ${index} is unique in its own way ${index}.`,
        })),
        resubmitted,
      ];

      const flagged = reviewListings(store).filter((review) => review.issues.some((issue) => issue.rule === "4.2"));

      expect(flagged.map((review) => review.listing.name)).toEqual(["Inbox Ace", "Reply Pilot"]);
    });
  });
});
