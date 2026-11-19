import type { AppListing, PricingPlan } from "@/lib/fanvue/types";

/**
 * The listing rules from `docs/listing-requirements.md`. All six are written
 * and `npm test` checks them. You do not need to change what they find. You
 * may change how the code is organised if your design needs it.
 */

/**
 * `reject`: the listing cannot go live as it is. `fix`: the developer can correct
 * it without anyone's judgement. `warn`: a person should look.
 */
export type Severity = "reject" | "fix" | "warn";

/**
 * One moderation finding on a listing.
 *
 * - `code`: stable machine-readable id for the check (e.g. `"too_few_screenshots"`).
 * - `rule`: section number from `docs/listing-requirements.md` (e.g. `"2.3"`).
 * - `severity`: what should happen next.
 * - `message`: what a moderator reads.
 * - `field`: optional path into the listing, e.g. `appUrl` or `pricingPlans[0].price`.
 */
export type Issue = {
  code: string;
  rule: string;
  severity: Severity;
  message: string;
  field?: string;
  /** The text that triggered the finding, quoted as it appears in the listing. */
  evidence?: string;
  /** 4.2 only: the other listing in the pair. */
  relatedListingUuid?: string;
};

/** The revision of `docs/listing-requirements.md` these rules implement. */
export const RULE_REVISION = "3";

/** One listing and everything the rules found on it. */
export type Review = {
  listing: AppListing;
  issues: Issue[];
};

/**
 * Reviews a set of listings and returns the findings for each, in the order
 * they came in.
 *
 * Takes the whole set because 4.2 compares listings to each other: a listing's
 * 4.2 findings depend on every other listing passed in. The other five rules
 * need only the one listing (`checkListing`).
 *
 * Pure: no I/O, and the same input always gives the same output.
 */
export function reviewListings(listings: AppListing[]): Review[] {
  const duplicates = findDuplicates(listings);
  return listings.map((listing, index) => ({
    listing,
    issues: [...checkListing(listing), ...(duplicates.get(index) ?? [])],
  }));
}

/** The five rules that need only the one listing in front of it: 1.6, 2.1, 2.3, 3.3 and 6.2. */
export function checkListing(listing: AppListing): Issue[] {
  return [
    ...checkCompetitorMentions(listing),
    ...checkDraftCopy(listing),
    ...checkScreenshotCount(listing),
    ...checkPricing(listing),
    ...checkAppUrl(listing),
  ];
}

/** Every piece of copy a user can read before opening the app, with the field it came from. */
function readableCopy(listing: AppListing): { field: string; text: string }[] {
  return [
    { field: "name", text: listing.name },
    { field: "tagline", text: listing.tagline },
    { field: "description", text: listing.description },
    { field: "descriptionTitle", text: listing.descriptionTitle },
    { field: "descriptionBody", text: listing.descriptionBody },
    ...listing.highlights.map((text, index) => ({ field: `highlights[${index}]`, text })),
  ];
}

/**
 * Rule 1.6, the competing platforms in revision 3. Each name is split into the
 * words a disguise separates (`only.fans`, `fans-ly`). Revision 4 changes this
 * list and nothing else.
 */
const COMPETING_PLATFORMS: { name: string; words: string[] }[] = [
  { name: "OnlyFans", words: ["only", "fans"] },
  { name: "Fansly", words: ["fans", "ly"] },
  { name: "Patreon", words: ["patreon"] },
  { name: "LoyalFans", words: ["loyal", "fans"] },
  { name: "ManyVids", words: ["many", "vids"] },
  { name: "JustForFans", words: ["just", "for", "fans"] },
];

/** Digits and symbols used in place of letters (`0nlyFans`, `Fans1y`). */
const LOOKALIKES: Record<string, string> = { o: "o0", l: "l1|", i: "i1!|", e: "e3", a: "a4@", s: "s5$", t: "t7" };

const letterPattern = (letter: string) => `[${(LOOKALIKES[letter] ?? letter).replace(/[|$]/g, "\\$&")}]`;

/**
 * Two patterns per platform:
 *
 * - `joined`: the words run together or split by punctuation (`OnlyFans`,
 *   `0nlyFans`, `only.fans`, `fans-ly`), in any casing. Ordinary English never
 *   writes these, so they always count.
 * - `spaced`: the words split by a space. `the only fans who tip` is grammar,
 *   so this counts only when every word is capitalised, as a name is
 *   (`Only Fans`). The doc prefers a missed disguise to a false rejection.
 */
const PLATFORM_PATTERNS = COMPETING_PLATFORMS.map(({ name, words }) => {
  const word = (text: string) => [...text].map(letterPattern).join("");
  return {
    name,
    joined: new RegExp(`(?<![a-z0-9])${words.map(word).join("[._\\-*]*")}(?![a-z0-9])`, "giu"),
    spaced:
      words.length > 1
        ? new RegExp(
            `(?<![A-Za-z0-9])${words.map((w) => `[${w[0]!.toUpperCase()}]${word(w.slice(1))}`).join("\\s+")}(?![A-Za-z0-9])`,
            "gu",
          )
        : null,
  };
});

/** Rule 1.6: the copy names or promotes a competing creator platform. */
function checkCompetitorMentions(listing: AppListing): Issue[] {
  const issues: Issue[] = [];
  for (const { field, text } of readableCopy(listing)) {
    for (const { name, joined, spaced } of PLATFORM_PATTERNS) {
      const matches = [...text.matchAll(joined), ...(spaced ? text.matchAll(spaced) : [])].map((match) => match[0]);
      for (const matched of new Set(matches)) {
        issues.push({
          code: "competitor_platform_mentioned",
          rule: "1.6",
          severity: "reject",
          message: `The ${field} mentions ${name} ("${matched}"). Listings must not name or promote another creator platform.`,
          field,
          evidence: matched,
        });
      }
    }
  }
  return issues;
}

/**
 * Rule 2.1's markers of draft copy. `TODO`, `TBD` and `FIXME` count only in
 * capitals, the way people leave them, so "a todo list app" is not a finding.
 * The rest count in any casing.
 */
const DRAFT_MARKERS = [
  /\bTODO\b/g,
  /\bTBD\b/g,
  /\bFIXME\b/g,
  /\blorem\b/gi,
  /\bipsum\b/gi,
  /\bcoming soon\b/gi,
  /\bplaceholder\b/gi,
  /\bsample text\b/gi,
];

/** Rule 2.1: draft or placeholder copy, or no highlights at all. */
function checkDraftCopy(listing: AppListing): Issue[] {
  const copy = [
    ...readableCopy(listing),
    // Plan copy is on the listing too: the creator reads it on the plan card.
    ...listing.pricingPlans.flatMap((plan, index) => [
      { field: `pricingPlans[${index}].name`, text: plan.name },
      { field: `pricingPlans[${index}].description`, text: plan.description ?? "" },
      ...plan.highlights.map((text, highlight) => ({ field: `pricingPlans[${index}].highlights[${highlight}]`, text })),
    ]),
  ];

  const issues: Issue[] = [];
  for (const { field, text } of copy) {
    const found = DRAFT_MARKERS.flatMap((marker) => [...text.matchAll(marker)].map((match) => match[0]));
    if (found.length === 0) continue;
    issues.push({
      code: "draft_copy",
      rule: "2.1",
      severity: "fix",
      message: `The ${field} still has draft copy: ${found.map((marker) => `"${marker}"`).join(", ")}.`,
      field,
      evidence: text,
    });
  }

  if (listing.highlights.length === 0) {
    issues.push({
      code: "no_highlights",
      rule: "2.1",
      severity: "fix",
      message: "The listing has no highlights.",
      field: "highlights",
    });
  }
  return issues;
}

/** Rule 2.3: a listing needs at least two unique screenshots. */
function checkScreenshotCount(listing: AppListing): Issue[] {
  const distinct = new Set(listing.previewImageUrls).size;
  if (distinct >= 2) return [];

  return [
    {
      code: "too_few_screenshots",
      rule: "2.3",
      severity: "fix",
      message:
        distinct === listing.previewImageUrls.length
          ? `Only ${distinct} screenshot${distinct === 1 ? "" : "s"}; rule 2.3 needs two.`
          : `${listing.previewImageUrls.length} screenshots but only ${distinct} distinct; rule 2.3 needs two.`,
      field: "previewImageUrls",
    },
  ];
}

/** Rule 3.3's supported range for a paid plan, in US cents. Revision 4 raises the ceiling. */
export const PRICE_RANGE_USD_CENTS = { min: 399, max: 50000 };

/**
 * Plans a creator can buy now or once the app is approved. A withdrawn plan is
 * not purchasable, so what it costs is no longer shown as true or false.
 */
const offeredPlans = (listing: AppListing) => listing.pricingPlans.filter((plan) => plan.status !== "withdrawn");

const isFreePlan = (plan: PricingPlan) => plan.billingType === "free" || plan.price === 0;

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const FREE_CLAIM = /\bfree[\s-](?:plan|tier|forever|to[\s-]start)\b/gi;

/**
 * Rule 3.3: pricing shown to a creator must be true and inside the range.
 * Separate checks, so a moderator sees which one fired.
 */
function checkPricing(listing: AppListing): Issue[] {
  const issues: Issue[] = [];
  const plans = offeredPlans(listing);

  listing.pricingPlans.forEach((plan, index) => {
    if (plan.status === "withdrawn" || isFreePlan(plan)) return;
    const field = `pricingPlans[${index}].price`;
    if (plan.currencyCode !== "USD") {
      // The range is in dollars. Converting would be a guess, so a person checks it.
      issues.push({
        code: "price_currency_unverifiable",
        rule: "3.3",
        severity: "warn",
        message: `The ${plan.name} plan is priced in ${plan.currencyCode}, so it cannot be checked against the supported range in US dollars.`,
        field,
        evidence: `${(plan.price / 100).toFixed(2)} ${plan.currencyCode}`,
      });
    } else if (plan.price < PRICE_RANGE_USD_CENTS.min || plan.price > PRICE_RANGE_USD_CENTS.max) {
      issues.push({
        code: "price_out_of_range",
        rule: "3.3",
        severity: "fix",
        message: `The ${plan.name} plan costs ${dollars(plan.price)}. Paid plans must be between ${dollars(PRICE_RANGE_USD_CENTS.min)} and ${dollars(PRICE_RANGE_USD_CENTS.max)}.`,
        field,
        evidence: dollars(plan.price),
      });
    }
  });

  if (plans.some(isFreePlan)) return issues;
  for (const { field, text } of readableCopy(listing)) {
    for (const match of text.matchAll(FREE_CLAIM)) {
      issues.push({
        code: "free_plan_missing",
        rule: "3.3",
        severity: "fix",
        message: `The ${field} advertises a "${match[0]}", but the listing has no free plan.`,
        field,
        evidence: match[0],
      });
    }
  }

  return issues;
}

/** Rule 6.2's domain-parking and site-builder placeholder hosts. */
const PLACEHOLDER_HOSTS = ["parkingcrew.net", "sedoparking.com", "afternic.com", "godaddysites.com", "wixsite.com"];

/** True for `domain` itself or any subdomain of it. `notfanvue.com` and `fanvue.com.example` are neither. */
const isOnDomain = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

/** What is wrong with an `appUrl`, most serious first, or `null` when it is fine. */
function appUrlProblem(appUrl: string | null): Omit<Issue, "rule" | "field"> | null {
  if (!appUrl?.trim()) {
    return { code: "app_url_missing", severity: "fix", message: "The listing has no app URL." };
  }

  let url: URL;
  try {
    url = new URL(appUrl.trim());
  } catch {
    return {
      code: "app_url_invalid",
      severity: "fix",
      message: `The app URL "${appUrl}" is not a valid URL.`,
      evidence: appUrl,
    };
  }

  // The URL parser lowercases the host and turns `0x7f.1` into `127.0.0.1`.
  const host = url.hostname.replace(/\.$/, "");
  if (!host) {
    return {
      code: "app_url_no_host",
      severity: "fix",
      message: `The app URL "${appUrl}" has no host.`,
      evidence: appUrl,
    };
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.startsWith("[")) {
    return {
      code: "app_url_ip_host",
      severity: "reject",
      message: `The app URL points at an IP address (${host}), not a domain the developer owns.`,
      evidence: appUrl,
    };
  }
  if (isOnDomain(host, "fanvue.com")) {
    return {
      code: "app_url_on_fanvue",
      severity: "reject",
      message: `The app URL is on ${host}. Apps must run on the developer's own domain, not Fanvue's.`,
      evidence: appUrl,
    };
  }
  const placeholder = PLACEHOLDER_HOSTS.find((domain) => isOnDomain(host, domain));
  if (placeholder) {
    return {
      code: "app_url_placeholder_host",
      severity: "reject",
      message: `The app URL is on ${placeholder}, a parking or site-builder placeholder, not a domain the developer owns.`,
      evidence: appUrl,
    };
  }
  if (url.protocol !== "https:") {
    return {
      code: "app_url_not_https",
      severity: "fix",
      message: `The app URL uses ${url.protocol.slice(0, -1)}, not https.`,
      evidence: appUrl,
    };
  }
  return null;
}

/** Rule 6.2: `appUrl` must be https, on a real host the developer owns. */
function checkAppUrl(listing: AppListing): Issue[] {
  const problem = appUrlProblem(listing.appUrl);
  return problem ? [{ ...problem, rule: "6.2", field: "appUrl" }] : [];
}

/**
 * Rule 4.2: how alike two descriptions must be to count as one listing
 * resubmitted. Jaccard similarity of their three-word runs: 1 is identical, 0
 * shares nothing. In the fixtures the resubmitted pair scores 0.90 and the
 * closest unrelated pair 0.33, so 0.5 leaves room either side. A template
 * resubmitted with a rewritten paragraph would score lower: that is the
 * trade-off of a number this simple, and the reason the finding is warn.
 */
export const DUPLICATE_THRESHOLD = 0.5;

/** `description` and `descriptionBody` as words: lowercase, no punctuation, no app name. */
function comparableWords(listing: AppListing): string[] {
  const words = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const name = words(listing.name).join(" ");
  const text = ` ${words(`${listing.description} ${listing.descriptionBody}`).join(" ")} `;
  return (name ? text.split(` ${name} `).join(" ") : text).trim().split(" ").filter(Boolean);
}

const shinglesOf = (words: string[]) => {
  const shingles = new Set<string>();
  for (let index = 0; index + 3 <= words.length; index += 1) shingles.add(words.slice(index, index + 3).join(" "));
  return shingles;
};

/** The longest run of words two descriptions share, so a reviewer sees what matched. */
function longestSharedRun(a: string[], b: string[]): string {
  let best = { length: 0, end: 0 };
  let previous = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    const current = new Array<number>(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] !== b[j - 1]) continue;
      current[j] = previous[j - 1]! + 1;
      if (current[j]! > best.length) best = { length: current[j]!, end: i };
    }
    previous = current;
  }
  return a.slice(best.end - best.length, best.end).join(" ");
}

/**
 * Compares every listing's description with every other developer's and
 * returns the 4.2 findings by listing index. Both listings in a pair are
 * flagged, each pointing at the other. A person decides which came first.
 *
 * Scoring all two million pairs is slow, so this uses prefix filtering: sort
 * each listing's runs rarest first. Two sets can only reach the threshold if
 * they share one of the first `size - ceil(threshold * size) + 1` runs of
 * either set, so only pairs that share one of those are scored. It finds
 * exactly the pairs a full comparison would.
 */
export function findDuplicates(listings: AppListing[]): Map<number, Issue[]> {
  const words = listings.map(comparableWords);
  const shingles = words.map(shinglesOf);

  const frequency = new Map<string, number>();
  for (const set of shingles) for (const shingle of set) frequency.set(shingle, (frequency.get(shingle) ?? 0) + 1);
  const rarestFirst = (x: string, y: string) => frequency.get(x)! - frequency.get(y)! || (x < y ? -1 : x > y ? 1 : 0);

  const holders = new Map<string, number[]>();
  shingles.forEach((set, index) => {
    const prefix = [...set].sort(rarestFirst).slice(0, set.size - Math.ceil(DUPLICATE_THRESHOLD * set.size) + 1);
    for (const shingle of prefix) {
      const list = holders.get(shingle);
      if (list) list.push(index);
      else holders.set(shingle, [index]);
    }
  });

  // Pair keys as numbers (`a * n + b`, with a < b): far cheaper than strings.
  const candidates = new Set<number>();
  for (const list of holders.values()) {
    for (let a = 0; a < list.length; a += 1) {
      for (let b = a + 1; b < list.length; b += 1) candidates.add(list[a]! * listings.length + list[b]!);
    }
  }

  const findings = new Map<number, Issue[]>();
  const flag = (index: number, other: number, similarity: number, shared: string) => {
    const issue: Issue = {
      code: "duplicate_listing",
      rule: "4.2",
      severity: "warn",
      message: `The description matches ${listings[other]!.name} by ${listings[other]!.developer.name ?? "another developer"} (${Math.round(similarity * 100)}% the same). One may be a resubmission of the other.`,
      field: "descriptionBody",
      evidence: shared,
      relatedListingUuid: listings[other]!.uuid,
    };
    findings.set(index, [...(findings.get(index) ?? []), issue]);
  };

  for (const key of [...candidates].sort((x, y) => x - y)) {
    const a = Math.floor(key / listings.length);
    const b = key % listings.length;
    const handleA = listings[a]!.developer.handle;
    if (handleA && handleA === listings[b]!.developer.handle) continue;

    const setA = shingles[a]!;
    const setB = shingles[b]!;
    let shared = 0;
    for (const shingle of setA) if (setB.has(shingle)) shared += 1;
    const similarity = shared / (setA.size + setB.size - shared);
    if (similarity < DUPLICATE_THRESHOLD) continue;

    const run = longestSharedRun(words[a]!, words[b]!);
    flag(a, b, similarity, run);
    flag(b, a, similarity, run);
  }

  return findings;
}
