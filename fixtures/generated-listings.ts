import type { AppListing, PricingPlan } from "@/lib/fanvue/types";

/**
 * The rest of the review queue: 2,000 synthetic submissions, so the queue is
 * roughly the size a real one would be.
 *
 * Generated deterministically from the index, which is why they read a little
 * samey — they are here to fill the queue, not to be interesting. A slice of
 * them break rules, on the fixed intervals below, so status, sorting and
 * filters have something to work with. The listings the moderation spec is
 * written against are the hand-written ones in `named-listings.ts`.
 */

const VERBS = [
  "tracks", "groups", "ranks", "drafts", "schedules", "summarises", "tags", "exports", "forecasts", "audits",
  "imports", "tidies", "compares", "scores", "segments", "batches", "syncs", "archives", "charts", "watches",
  "queues", "reconciles", "labels", "splits", "flags", "bundles", "trims", "dedupes", "annotates", "routes",
];

const NOUNS = [
  "payouts", "subscribers", "message threads", "tips", "renewals", "captions", "media files", "posting slots",
  "refund requests", "custom requests", "watch time", "bundles", "promo codes", "chat replies", "upload queues",
  "content tags", "price tests", "welcome flows", "churn signals", "referral links", "trial signups",
  "cancellation reasons", "top spenders", "quiet weeks", "repeat buyers", "unread requests", "clip exports",
  "collab briefs", "payout statements", "dormant fans",
];

const JOINERS = [", then ", ", and ", ". It ", ", plus ", ". Then ", ", so it ", ". Also ", ", before it "];

const OUTCOME_HEADS = [
  "a week of admin", "the routine work", "your quiet Sunday", "the monthly wrap-up", "next month's plan",
  "the follow-ups", "your busiest evening", "the reporting", "the housekeeping", "the whole backlog",
];

const OUTCOME_TAILS = [
  "stops eating your evenings", "happens without you", "fits in one sitting", "stays off your desk",
  "is done by Monday", "no longer needs a spreadsheet", "runs on its own", "takes minutes instead of hours",
  "is somebody else's job", "is finished before you look",
];

const TITLES = [
  "Built for the boring half of the job", "Less admin, same output", "The part nobody wants to do by hand",
  "One screen instead of six tabs", "Set it up once", "Made for people who post daily",
  "Your week, already organised", "Quietly does the paperwork",
];

const NAME_HEADS = ["Reach", "Signal", "Ledger", "Cadence", "Beacon", "Harbour", "Quill", "Lantern", "Compass", "Anchor"];
const NAME_TAILS = ["ly", "wise", "board", "deck", "lab", "works", "kit", "flow"];
const DEV_HEADS = ["Northbeam", "Tidewater", "Quarterlight", "Foundry", "Meridian", "Sandpiper", "Ridgeline", "Copperline"];
const DEV_TAILS = ["Labs", "Software", "Studio", "Systems", "Digital", "Tools"];
const TLDS = ["io", "app", "dev", "co", "tools", "studio"];

/** 1.6 violations rotate through these: plain, digit-swapped and separated spellings. */
const COMPETITOR_MENTIONS = [
  "OnlyFans", "0nlyFans", "only.fans", "Only Fans", "Fansly", "Fans1y", "fans-ly", "Patreon", "LoyalFans", "ManyVids",
];

/** Mixes the index into an unrelated-looking number, so slot choices do not move in step. */
function scramble(index: number, slot: number): number {
  let value = (index + 1) * 2654435761 + (slot + 1) * 40503;
  value ^= value >>> 13;
  value = (value * 1274126177) >>> 0;
  return value ^ (value >>> 16);
}

const pick = <T>(bank: readonly T[], index: number, slot: number): T =>
  bank[Math.abs(scramble(index, slot)) % bank.length]!;

const hex = (value: number, length: number) => value.toString(16).padStart(length, "0");
const capitalise = (text: string) => `${text[0]!.toUpperCase()}${text.slice(1)}`;

function generatedListing(index: number): AppListing {
  const serial = String(index + 1).padStart(4, "0");
  const name = `${pick(NAME_HEADS, index, 1)}${pick(NAME_TAILS, index, 2)} ${serial}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const developerName = `${pick(DEV_HEADS, index, 3)} ${pick(DEV_TAILS, index, 4)}`;

  // Five clauses, rotated so two listings that happen to share a clause do not
  // share the sentence around it.
  const clauses = [0, 1, 2, 3, 4].map(
    (slot) => `${pick(VERBS, index, 10 + slot)} ${pick(NOUNS, index, 20 + slot)}`,
  );
  const rotation = Math.abs(scramble(index, 99)) % clauses.length;
  const ordered = [...clauses.slice(rotation), ...clauses.slice(0, rotation)];
  const outcome = `${pick(OUTCOME_HEADS, index, 5)} ${pick(OUTCOME_TAILS, index, 6)}`;
  const secondOutcome = `${pick(OUTCOME_HEADS, index, 15)} ${pick(OUTCOME_TAILS, index, 16)}`;

  const sentence = ordered
    .slice(1)
    .reduce((text, clause, slot) => `${text}${pick(JOINERS, index, 30 + slot)}${clause}`, capitalise(ordered[0]!));

  const basePrice = 799 + (index % 40) * 100;
  const plans: PricingPlan[] = [
    {
      uuid: `${hex(index + 1, 8)}-1a11-4b22-8c33-${hex(index + 1, 12)}`,
      name: "Standard",
      description: `${capitalise(ordered[0]!)} for one account.`,
      billingType: "recurring",
      interval: "monthly",
      price: basePrice,
      currencyCode: "USD",
      status: "active",
      highlights: [ordered[0]!, ordered[1]!],
    },
  ];

  // 3.3: a plan priced above the supported range.
  if (index % 37 === 0) {
    plans.push({
      uuid: `${hex(index + 1, 8)}-2a11-4b22-8c33-${hex(index + 1, 12)}`,
      name: "Agency",
      description: "Every account you manage, one bill.",
      billingType: "recurring",
      interval: "monthly",
      price: 62500,
      currencyCode: "USD",
      status: "active",
      highlights: [ordered[2]!, ordered[3]!],
    });
  }

  // 1.6: the tagline names a competing platform, sometimes disguised.
  const tagline =
    index % 31 === 0
      ? `${capitalise(ordered[1]!)} for creators moving over from ${pick(COMPETITOR_MENTIONS, index, 7)}`
      : `${capitalise(ordered[1]!)} without the spreadsheet`;

  // 3.3: the copy quotes a price no plan charges.
  const description =
    index % 47 === 0
      ? `From $4.50 a month: ${ordered[2]} and ${ordered[3]}, for anyone whose ${secondOutcome}.`
      : `${capitalise(ordered[2]!)} and ${ordered[3]}, for anyone whose ${secondOutcome}.`;

  // 2.1: draft copy left in the description.
  const descriptionBody = `${index % 43 === 0 ? "TODO: tighten this copy before launch. " : ""}${name} ${sentence}, until ${outcome}.`;

  // 6.2: plain HTTP, a parking host, or no URL at all.
  let appUrl: string | null = `https://${slug}.${pick(TLDS, index, 8)}`;
  if (index % 23 === 0) appUrl = `http://${slug}.${pick(TLDS, index, 8)}`;
  if (index % 29 === 0) appUrl = `https://${slug}.parkingcrew.net`;
  if (index % 41 === 0) appUrl = null;

  // 2.3: the same screenshot listed twice.
  const previewImageUrls =
    index % 17 === 0
      ? [`https://placehold.co/800x500/png?text=${slug}+1`, `https://placehold.co/800x500/png?text=${slug}+1`]
      : [`https://placehold.co/800x500/png?text=${slug}+1`, `https://placehold.co/800x500/png?text=${slug}+2`];

  return {
    uuid: `${hex(index + 1, 8)}-0a11-4b22-8c33-${hex(index + 1, 12)}`,
    name,
    tagline,
    description,
    logoUrl: `https://placehold.co/256x256/png?text=${serial}`,
    appUrl,
    pricingType: "monthly",
    rating: index % 5 === 0 ? { average: null, count: null } : { average: 3.5 + (index % 15) / 10, count: index % 400 },
    developer: { name: developerName, handle: developerName.toLowerCase().replace(/[^a-z0-9]/g, "-") },
    descriptionTitle: pick(TITLES, index, 9),
    descriptionBody,
    highlights: [ordered[0]!, ordered[1]!, ordered[2]!],
    heroImageUrl: `https://placehold.co/1200x630/png?text=${slug}`,
    previewImageUrls,
    galleryImageUrls: [`https://placehold.co/1280x800/png?text=${slug}+gallery`],
    pricingPlans: plans,
    ratingDistribution: null,
  };
}

export const GENERATED_LISTING_COUNT = 2000;

export const generatedListings: AppListing[] = Array.from({ length: GENERATED_LISTING_COUNT }, (_unused, index) =>
  generatedListing(index),
);
