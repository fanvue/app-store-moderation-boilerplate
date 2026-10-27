import type { AppListing, PricingPlan } from '@/lib/fanvue/types'

/**
 * `reject`: the listing cannot go live as it is. `fix`: the developer can correct
 * it without anyone's judgement. `warn`: a person should look.
 */
export type Severity = 'reject' | 'fix' | 'warn'

/**
 * One moderation finding on a listing.
 *
 * - `code`: stable machine-readable id for the check (e.g. `"too_few_screenshots"`).
 * - `rule`: section number from `docs/listing-requirements.md` (e.g. `"2.3"`).
 * - `severity`: what should happen next. You choose it per rule, and we will ask why.
 * - `message`: what a moderator reads.
 * - `field`: optional path into the listing, e.g. `appUrl` or `pricingPlans[0].price`.
 *
 * The specs read only `rule`, `severity`, `code` and `message`. Add fields if a
 * finding needs to carry more, such as the text matched or the other listing
 * in a 4.2 pair.
 */
export type Issue = {
  code: string
  rule: string
  severity: Severity
  message: string
  field?: string
  /** The text the check matched, so a reviewer can see why it fired. */
  matched?: string
  /** For 4.2: the other listing in the pair. */
  relatedListingUuid?: string
}

/** One listing and everything the rules found on it. */
export type Review = {
  listing: AppListing
  issues: Issue[]
}

/**
 * Reviews a set of listings and returns the findings for each, in the order
 * they came in.
 *
 * Takes the whole set because 4.2 compares listings to each other. You decide
 * how to organise the code inside.
 *
 * Pure: no I/O, and the same input always gives the same output.
 */
export function reviewListings(listings: AppListing[]): Review[] {
  const duplicates = checkOriginality(listings)
  return listings.map(listing => ({
    issues: [...checkListing(listing), ...(duplicates.get(listing) ?? [])],
    listing,
  }))
}

/** Every check that only needs the one listing in front of it. */
function checkListing(listing: AppListing): Issue[] {
  return [
    ...checkCompetitorMentions(listing),
    ...checkDraftCopy(listing),
    ...checkScreenshotCount(listing),
    ...checkPricing(listing),
    ...checkAppUrl(listing),
  ]
}

/** One piece of copy a user can read before opening the app, with its path into the listing. */
type Copy = { field: string; text: string }

/** The copy rules 1.6, 2.1 and 3.3 read: app name, tagline, description, description title and body, highlights. */
function listingCopy(listing: AppListing): Copy[] {
  return [
    { field: 'name', text: listing.name },
    { field: 'tagline', text: listing.tagline },
    { field: 'description', text: listing.description },
    { field: 'descriptionTitle', text: listing.descriptionTitle },
    { field: 'descriptionBody', text: listing.descriptionBody },
    ...listing.highlights.map((text, index) => ({ field: `highlights[${index}]`, text })),
  ]
}

/** Rule 1.6, revision 3: the competing platforms, each split into the English words it is made of. */
const COMPETITORS = [
  { name: 'OnlyFans', words: ['only', 'fans'] },
  { name: 'Fansly', words: ['fansly'] },
  { name: 'Patreon', words: ['patreon'] },
  { name: 'LoyalFans', words: ['loyal', 'fans'] },
  { name: 'ManyVids', words: ['many', 'vids'] },
  { name: 'JustForFans', words: ['just', 'for', 'fans'] },
]

/** Characters used in place of letters (`0nlyFans`, `Fans1y`). Each maps to one letter so positions line up with the original. */
const LOOKALIKES: Record<string, string> = {
  '@': 'a',
  $: 's',
  '0': 'o',
  '1': 'l',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
}

/** Up to two separator characters between any two letters of a name (`only.fans`, `fans-ly`, `Only Fans`). */
const SEPARATOR = '[\\s._\\-*·|/\\\\]{0,2}'

const COMPETITOR_PATTERNS = COMPETITORS.map(competitor => ({
  ...competitor,
  pattern: new RegExp(`(?<![a-z])${competitor.words.join('').split('').join(SEPARATOR)}(?![a-z])`, 'g'),
}))

/** Lower-cases and swaps lookalikes one character at a time, so match indices still point into the original text. */
function normaliseForNames(text: string): string {
  return text
    .split('')
    .map(char => LOOKALIKES[char] ?? char.toLowerCase())
    .join('')
}

/**
 * True when a match is the platform's words used as plain English: separate words
 * split by spaces only, no lookalike characters, and ordinary casing. `the only fans`
 * and `Only fans who…` are English; `Only Fans`, `ONLY FANS` and `only.fans` are names.
 */
function isOrdinaryEnglish(matched: string, words: string[]): boolean {
  const parts = matched.split(/\s+/)
  const splitAtWords = parts.length > 1 && parts.every((part, index) => part.toLowerCase() === words[index])
  const ordinaryCasing = parts.every(part => /^[A-Z]?[a-z]*$/.test(part))
  const everyWordCapitalised = parts.every(part => /^[A-Z]/.test(part))
  return splitAtWords && ordinaryCasing && !everyWordCapitalised
}

/** Rule 1.6: copy must not name a competing creator platform, disguised or not. */
function checkCompetitorMentions(listing: AppListing): Issue[] {
  return listingCopy(listing).flatMap(({ field, text }) =>
    COMPETITOR_PATTERNS.flatMap(({ name, words, pattern }) =>
      [...normaliseForNames(text).matchAll(pattern)]
        .map(match => text.slice(match.index, match.index + match[0].length))
        .filter(matched => !isOrdinaryEnglish(matched, words))
        .map(matched => ({
          code: 'competitor_mention',
          field,
          matched,
          message: `${field} mentions ${name} as "${matched}"; rule 1.6 does not allow naming a competing platform.`,
          rule: '1.6',
          severity: 'reject' as const,
        })),
    ),
  )
}

/** Rule 2.1: markers of draft or placeholder copy, matched as whole words in any case. */
const DRAFT_MARKERS = /\b(lorem|ipsum|todo|tbd|fixme|coming\s+soon|placeholder|sample\s+text)\b/gi

/** Rule 2.1: copy must be finished, and the listing must have highlights. */
function checkDraftCopy(listing: AppListing): Issue[] {
  const markerIssues = listingCopy(listing).flatMap(({ field, text }) => {
    const markers = [...text.matchAll(DRAFT_MARKERS)].map(match => match[0])
    if (markers.length === 0) {
      return []
    }

    const matched = markers.join(', ')
    return [
      {
        code: 'draft_copy',
        field,
        matched,
        message: `${field} contains draft or placeholder copy (${matched}); rule 2.1 needs finished copy.`,
        rule: '2.1',
        severity: 'fix' as const,
      },
    ]
  })

  const hasHighlights = listing.highlights.some(highlight => highlight.trim().length > 0)
  const highlightIssues: Issue[] = hasHighlights
    ? []
    : [
        {
          code: 'empty_highlights',
          field: 'highlights',
          message: 'The listing has no highlights; rule 2.1 counts empty highlights as unfinished.',
          rule: '2.1',
          severity: 'fix',
        },
      ]

  return [...markerIssues, ...highlightIssues]
}

/** Rule 3.3, revision 3: the supported range for a paid plan, in US cents. */
const PRICE_RANGE_USD_CENTS = { max: 50000, min: 399 }

/** Rule 3.3: copy that advertises a free plan. */
const FREE_PLAN_COPY = /\bfree\s+(plan|tier|forever|to\s+start)\b/i

const formatUsd = (cents: number) =>
  new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(cents / 100)

/** A plan a creator can buy now, or will be able to once the app is approved. */
const isPurchasable = (plan: PricingPlan) => plan.status !== 'withdrawn'

const isFreePlan = (plan: PricingPlan) => plan.billingType === 'free' || plan.price === 0

/** Rule 3.3: paid plans inside the supported USD range, and no advertised free plan that does not exist. */
function checkPricing(listing: AppListing): Issue[] {
  const planIssues = listing.pricingPlans.flatMap((plan, index): Issue[] => {
    if (!isPurchasable(plan) || isFreePlan(plan)) {
      return []
    }

    const field = `pricingPlans[${index}].price`
    if (plan.currencyCode.toUpperCase() !== 'USD') {
      return [
        {
          code: 'price_unverifiable_currency',
          field,
          message: `Plan "${plan.name}" is priced in ${plan.currencyCode}; rule 3.3's range is in US dollars and cannot be checked without an exchange rate.`,
          rule: '3.3',
          severity: 'warn',
        },
      ]
    }

    const { min, max } = PRICE_RANGE_USD_CENTS
    if (plan.price >= min && plan.price <= max) {
      return []
    }

    return [
      {
        code: 'price_out_of_range',
        field,
        message: `Plan "${plan.name}" costs ${formatUsd(plan.price)}; rule 3.3 allows ${formatUsd(min)} to ${formatUsd(max)}.`,
        rule: '3.3',
        severity: 'reject',
      },
    ]
  })

  const advertised = listingCopy(listing)
    .map(({ field, text }) => ({ field, matched: FREE_PLAN_COPY.exec(text)?.[0] }))
    .find(copy => copy.matched !== undefined)
  const hasFreePlan = listing.pricingPlans.some(plan => isPurchasable(plan) && isFreePlan(plan))
  const freeIssues: Issue[] =
    advertised && !hasFreePlan
      ? [
          {
            code: 'free_plan_missing',
            field: advertised.field,
            matched: advertised.matched,
            message: `${advertised.field} advertises "${advertised.matched}", but the listing has no free plan.`,
            rule: '3.3',
            severity: 'reject',
          },
        ]
      : []

  return [...planIssues, ...freeIssues]
}

/**
 * Rule 4.2: how close two descriptions must be to count as one listing, as the
 * share of three-word phrases they have in common (Jaccard). Renaming the app
 * and swapping a word or two keeps a resubmitted template far above it; two
 * different apps on the same topic share few exact three-word phrases.
 */
const DUPLICATE_THRESHOLD = 0.5
const SHINGLE_WORDS = 3

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Three-word phrases of `description` and `descriptionBody`, ignoring case, punctuation and the app's own name. */
function descriptionShingles(listing: AppListing): Set<string> {
  const words = `${listing.description} ${listing.descriptionBody}`
    .replace(new RegExp(escapeRegExp(listing.name), 'gi'), ' ')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return new Set(words.slice(SHINGLE_WORDS - 1).map((_, index) => words.slice(index, index + SHINGLE_WORDS).join(' ')))
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const shared = [...a].filter(shingle => b.has(shingle)).length
  const union = a.size + b.size - shared
  return union === 0 ? 0 : shared / union
}

const sameDeveloper = (a: AppListing, b: AppListing) =>
  a.developer.handle !== null && a.developer.handle === b.developer.handle

/** Rule 4.2: compares every pair of listings from different developers and flags both halves of a match. */
function checkOriginality(listings: AppListing[]): Map<AppListing, Issue[]> {
  const entries = listings.map(listing => ({ listing, shingles: descriptionShingles(listing) }))
  const pairs = entries
    .flatMap((a, index) =>
      entries.slice(index + 1).map(b => ({ a: a.listing, b: b.listing, similarity: jaccard(a.shingles, b.shingles) })),
    )
    .filter(({ a, b, similarity }) => !sameDeveloper(a, b) && similarity >= DUPLICATE_THRESHOLD)

  const duplicateIssue = (other: AppListing, similarity: number): Issue => ({
    code: 'duplicate_listing',
    field: 'description',
    message: `Description is ${Math.round(similarity * 100)}% the same as "${other.name}" by ${other.developer.handle ?? 'an unknown developer'} (threshold ${DUPLICATE_THRESHOLD * 100}%); rule 4.2 asks a person to decide which came first.`,
    relatedListingUuid: other.uuid,
    rule: '4.2',
    severity: 'warn',
  })

  return new Map(
    listings.map(listing => [
      listing,
      pairs.flatMap(({ a, b, similarity }) => {
        if (a === listing) {
          return [duplicateIssue(b, similarity)]
        }
        if (b === listing) {
          return [duplicateIssue(a, similarity)]
        }
        return []
      }),
    ]),
  )
}

/** Rule 6.2: hosts that are placeholders, never a domain the developer owns. Matched with their subdomains. */
const PLACEHOLDER_HOSTS = ['parkingcrew.net', 'sedoparking.com', 'afternic.com', 'godaddysites.com', 'wixsite.com']

/** True when `host` is `domain` or a subdomain of it, so `notfanvue.com` does not match `fanvue.com`. */
function isOnDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`)
}

/** Why `appUrl` breaks rule 6.2, or `null` when it does not. */
function appUrlProblem(appUrl: string | null): string | null {
  if (!appUrl) {
    return 'is missing'
  }
  if (!URL.canParse(appUrl)) {
    return 'is not a valid URL'
  }

  const { protocol, hostname } = new URL(appUrl)
  // `apps.fanvue.com.` is the same host as `apps.fanvue.com`; drop the trailing dot before comparing.
  const host = hostname.toLowerCase().replace(/\.+$/, '')

  if (protocol !== 'https:') {
    return 'is not https'
  }
  if (!host) {
    return 'has no host'
  }
  if (host.startsWith('[') || /^\d+(\.\d+){3}$/.test(host)) {
    return 'uses an IP address as its host'
  }
  if (isOnDomain(host, 'fanvue.com')) {
    return 'is on fanvue.com, not a domain the developer owns'
  }

  const placeholder = PLACEHOLDER_HOSTS.find(domain => isOnDomain(host, domain))
  if (placeholder) {
    return `is on ${placeholder}, a parking or site-builder placeholder host`
  }

  return null
}

/** Rule 6.2: `appUrl` must be https on a domain the developer owns. */
function checkAppUrl(listing: AppListing): Issue[] {
  const problem = appUrlProblem(listing.appUrl)
  if (!problem) {
    return []
  }

  return [
    {
      code: 'invalid_app_url',
      field: 'appUrl',
      message: listing.appUrl
        ? `App URL ${listing.appUrl} ${problem}; rule 6.2 needs an https URL on a domain the developer owns.`
        : `App URL ${problem}; rule 6.2 needs an https URL on a domain the developer owns.`,
      rule: '6.2',
      severity: 'reject',
    },
  ]
}

/** We've implemented this rule for you as an example. Rule 2.3: a listing needs at least two unique screenshots. */
function checkScreenshotCount(listing: AppListing): Issue[] {
  const distinct = new Set(listing.previewImageUrls).size
  if (distinct >= 2) {
    return []
  }

  return [
    {
      code: 'too_few_screenshots',
      field: 'previewImageUrls',
      matched: listing.previewImageUrls.length ? listing.previewImageUrls.join(', ') : '(no screenshots)',
      message:
        distinct === listing.previewImageUrls.length
          ? `Only ${distinct} screenshot${distinct === 1 ? '' : 's'}; rule 2.3 needs two.`
          : `${listing.previewImageUrls.length} screenshots but only ${distinct} distinct; rule 2.3 needs two.`,
      rule: '2.3',
      severity: 'fix',
    },
  ]
}
