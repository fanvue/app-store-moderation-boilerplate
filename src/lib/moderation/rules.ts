import type { AppListing } from "@/lib/fanvue/types";

export type Severity = "reject" | "fix" | "warn";

/**
 * One moderation finding on a listing.
 *
 * - `code`: stable machine-readable id for the check (e.g. `"too_few_screenshots"`); tests and UI key off it.
 * - `rule`: section number from `docs/listing-requirements.md` (e.g. `"2.3"`).
 * - `severity`: what the reviewer should do about it.
 * - `message`: explanation shown to the reviewer.
 * - `field`: optional path into the listing, e.g. `appUrl` or `pricingPlans[0].price`.
 */
export type Issue = {
  code: string;
  rule: string;
  severity: Severity;
  message: string;
  field?: string;
};

const MIN_PAID_PLAN_PRICE_USD = 399;
const MAX_PAID_PLAN_PRICE_USD = 50_000;
const COMPETING_PLATFORM_NAMES = ["onlyfans", "fansly"];
const EXTERNAL_PAYMENT_TERMS = ["stripe", "paypal", "payment link", "external checkout"];
const PLACEHOLDER_COPY_MARKERS = ["lorem ipsum", "todo"];
const SPANISH_LANGUAGE_SIGNATURE_WORDS = [
  "ordena",
  "biblioteca",
  "contenido",
  "carpetas",
  "inteligentes",
  "detecta",
  "archivos",
  "automáticamente",
];

type ListingTextField = {
  field: string;
  value: string;
};

/**
 * Runs every deterministic rule check against a listing and returns the findings.
 * Pure: no I/O, same input always gives the same output. See README.md.
 */
export function validateListing(listing: AppListing): Issue[] {
  return [
    ...checkScreenshotCount(listing),
    ...checkAppUrl(listing),
    ...checkPricingPlans(listing),
    ...checkCompetitorPromotion(listing),
    ...checkExternalPaymentPromotion(listing),
    ...checkPricingTypeConsistency(listing),
    ...checkPlaceholderCopy(listing),
    ...checkListingLanguage(listing),
  ];
}

function checkScreenshotCount(listing: AppListing): Issue[] {
  if (listing.previewImageUrls.length >= 2) return [];

  return [
    {
      code: "too_few_screenshots",
      rule: "2.3",
      severity: "reject",
      message: "Provide at least two screenshots showing the product in use.",
      field: "previewImageUrls",
    },
  ];
}

function checkAppUrl(listing: AppListing): Issue[] {
  if (listing.appUrl === null) {
    return [
      {
        code: "missing_app_url",
        rule: "6.2",
        severity: "reject",
        message: "Provide the app's production HTTPS URL.",
        field: "appUrl",
      },
    ];
  }

  let url: URL;
  try {
    url = new URL(listing.appUrl);
  } catch {
    return [
      {
        code: "invalid_app_url",
        rule: "6.2",
        severity: "reject",
        message: "Provide a valid production HTTPS URL.",
        field: "appUrl",
      },
    ];
  }

  if (url.protocol !== "https:") {
    return [
      {
        code: "app_url_not_https",
        rule: "6.2",
        severity: "reject",
        message: "The app URL must use HTTPS.",
        field: "appUrl",
      },
    ];
  }

  if (isFanvueDomain(url.hostname)) {
    return [
      {
        code: "app_url_uses_fanvue_domain",
        rule: "6.2",
        severity: "reject",
        message: "The app must use a domain owned by its developer, not a Fanvue domain.",
        field: "appUrl",
      },
    ];
  }

  return [];
}

function isFanvueDomain(hostname: string): boolean {
  return hostname === "fanvue.com" || hostname.endsWith(".fanvue.com");
}

function checkPricingPlans(listing: AppListing): Issue[] {
  return listing.pricingPlans.flatMap((plan, index) => [
    ...checkPaidPlanPrice(plan, index),
    ...checkPaidPlanBilling(plan, index),
    ...checkPlanNameLength(plan, index),
    ...checkPlanHighlightCount(plan, index),
  ]);
}

function checkCompetitorPromotion(listing: AppListing): Issue[] {
  const match = findTextMatch(listing, COMPETING_PLATFORM_NAMES, normalizeLeetspeak);
  if (!match) return [];

  return [
    {
      code: "competitor_platform_promotion",
      rule: "1.6",
      severity: "warn",
      message: `Listing copy refers to another creator platform (${match.term}). Review whether it directs users away from Fanvue.`,
      field: match.field,
    },
  ];
}

function checkExternalPaymentPromotion(listing: AppListing): Issue[] {
  const match = findTextMatch(listing, EXTERNAL_PAYMENT_TERMS);
  if (!match) return [];

  return [
    {
      code: "external_payment_promotion",
      rule: "3.1",
      severity: "warn",
      message: `Listing copy refers to ${match.term}, which may indicate an external payment flow.`,
      field: match.field,
    },
  ];
}

function checkPricingTypeConsistency(listing: AppListing): Issue[] {
  const hasPaidPlan = listing.pricingPlans.some((plan) => plan.billingType !== "free");
  const matchesPlanAccess = listing.pricingType === "monthly" ? hasPaidPlan : !hasPaidPlan;

  if (matchesPlanAccess) return [];

  return [
    {
      code: "pricing_type_does_not_match_plans",
      rule: "2.3",
      severity: "warn",
      message: `The listing is marked ${listing.pricingType}, but its pricing plans describe ${hasPaidPlan ? "paid" : "free"} access.`,
      field: "pricingType",
    },
  ];
}

function checkPlaceholderCopy(listing: AppListing): Issue[] {
  const match = findTextMatch(listing, PLACEHOLDER_COPY_MARKERS);
  if (!match) return [];

  return [
    {
      code: "placeholder_listing_copy",
      rule: "2.1",
      severity: "warn",
      message: `Listing copy contains the placeholder marker "${match.term}". Replace it before submission.`,
      field: match.field,
    },
  ];
}

function checkListingLanguage(listing: AppListing): Issue[] {
  const match = findTextMatch(listing, SPANISH_LANGUAGE_SIGNATURE_WORDS);
  if (!match) return [];

  const matchingTerms = SPANISH_LANGUAGE_SIGNATURE_WORDS.filter((term) =>
    listingText(listing).toLocaleLowerCase().includes(term),
  );
  if (matchingTerms.length < 3) return [];

  return [
    {
      code: "listing_may_not_be_english",
      rule: "2.3",
      severity: "warn",
      message: "Listing copy contains several Spanish-language terms. Confirm that the public listing is in English.",
      field: match.field,
    },
  ];
}

function findTextMatch(
  listing: AppListing,
  terms: readonly string[],
  transform: (value: string) => string = (value) => value.toLocaleLowerCase(),
): { field: string; term: string } | null {
  for (const { field, value } of listingTextFields(listing)) {
    const text = transform(value);
    const term = terms.find((candidate) => text.includes(transform(candidate)));
    if (term) return { field, term };
  }

  return null;
}

function listingText(listing: AppListing): string {
  return listingTextFields(listing)
    .map(({ value }) => value)
    .join(" ");
}

function listingTextFields(listing: AppListing): ListingTextField[] {
  return [
    { field: "name", value: listing.name },
    { field: "tagline", value: listing.tagline },
    { field: "description", value: listing.description },
    { field: "descriptionTitle", value: listing.descriptionTitle },
    { field: "descriptionBody", value: listing.descriptionBody },
    ...listing.highlights.map((value, index) => ({ field: `highlights[${index}]`, value })),
    ...listing.pricingPlans.flatMap((plan, index) => [
      { field: `pricingPlans[${index}].name`, value: plan.name },
      ...(plan.description === null ? [] : [{ field: `pricingPlans[${index}].description`, value: plan.description }]),
      ...plan.highlights.map((value, highlightIndex) => ({
        field: `pricingPlans[${index}].highlights[${highlightIndex}]`,
        value,
      })),
    ]),
  ];
}

function normalizeLeetspeak(value: string): string {
  return value.toLocaleLowerCase().replaceAll("0", "o").replaceAll("1", "l");
}

function checkPaidPlanPrice(plan: AppListing["pricingPlans"][number], index: number): Issue[] {
  const isPaidUsdPlan = plan.billingType !== "free" && plan.currencyCode === "USD";
  const isPriceInRange = plan.price >= MIN_PAID_PLAN_PRICE_USD && plan.price <= MAX_PAID_PLAN_PRICE_USD;

  if (!isPaidUsdPlan || isPriceInRange) return [];

  return [
    {
      code: "paid_plan_price_out_of_range",
      rule: "3.3",
      severity: "fix",
      message: "Paid USD plans must be priced between $3.99 and $500.00.",
      field: `pricingPlans[${index}].price`,
    },
  ];
}

function checkPaidPlanBilling(plan: AppListing["pricingPlans"][number], index: number): Issue[] {
  const isPaidPlan = plan.billingType !== "free";
  const isRecurringMonthly = plan.billingType === "recurring" && plan.interval === "monthly";

  if (!isPaidPlan || isRecurringMonthly) return [];

  return [
    {
      code: "paid_plan_not_monthly",
      rule: "3.3",
      severity: "fix",
      message: "Paid plans must be recurring monthly subscriptions.",
      field: `pricingPlans[${index}].interval`,
    },
  ];
}

function checkPlanNameLength(plan: AppListing["pricingPlans"][number], index: number): Issue[] {
  if (plan.name.length <= 20) return [];

  return [
    {
      code: "plan_name_too_long",
      rule: "3.3",
      severity: "fix",
      message: "Plan names must be 20 characters or fewer.",
      field: `pricingPlans[${index}].name`,
    },
  ];
}

function checkPlanHighlightCount(plan: AppListing["pricingPlans"][number], index: number): Issue[] {
  if (plan.highlights.length <= 5) return [];

  return [
    {
      code: "too_many_plan_highlights",
      rule: "3.3",
      severity: "fix",
      message: "Plans can have at most five highlight bullets.",
      field: `pricingPlans[${index}].highlights`,
    },
  ];
}
