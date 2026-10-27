import type { AppListing, PricingPlan } from '@/lib/fanvue/types'

/**
 * The rest of the review queue: 2,000 synthetic submissions, so the queue is
 * roughly the size a real one would be.
 *
 * Generated deterministically from the index. Some of them break rules, at the
 * fixed intervals below, so status, sorting and filters have something to work with. The listings the moderation spec is
 * written against are the hand-written ones in `named-listings.ts`.
 */

const VERBS = [
  'tracks',
  'groups',
  'ranks',
  'drafts',
  'schedules',
  'summarises',
  'tags',
  'exports',
  'forecasts',
  'audits',
  'imports',
  'tidies',
  'compares',
  'scores',
  'segments',
  'batches',
  'syncs',
  'archives',
  'charts',
  'watches',
  'queues',
  'reconciles',
  'labels',
  'splits',
  'flags',
  'bundles',
  'trims',
  'dedupes',
  'annotates',
  'routes',
] as const

const NOUNS = [
  'payouts',
  'subscribers',
  'message threads',
  'tips',
  'renewals',
  'captions',
  'media files',
  'posting slots',
  'refund requests',
  'custom requests',
  'watch time',
  'bundles',
  'promo codes',
  'chat replies',
  'upload queues',
  'content tags',
  'price tests',
  'welcome flows',
  'churn signals',
  'referral links',
  'trial signups',
  'cancellation reasons',
  'top spenders',
  'quiet weeks',
  'repeat buyers',
  'unread requests',
  'clip exports',
  'collab briefs',
  'payout statements',
  'dormant fans',
] as const

const JOINERS = [', then ', ', and ', '. It ', ', plus ', '. Then ', ', so it ', '. Also ', ', before it '] as const

const OUTCOME_HEADS = [
  'a week of admin',
  'the routine work',
  'your quiet Sunday',
  'the monthly wrap-up',
  "next month's plan",
  'the follow-ups',
  'your busiest evening',
  'the reporting',
  'the housekeeping',
  'the whole backlog',
] as const

const OUTCOME_TAILS = [
  'stops eating your evenings',
  'happens without you',
  'fits in one sitting',
  'stays off your desk',
  'is done by Monday',
  'no longer needs a spreadsheet',
  'runs on its own',
  'takes minutes instead of hours',
  "is somebody else's job",
  'is finished before you look',
] as const

const TITLES = [
  'Built for the boring half of the job',
  'Less admin, same output',
  'The part nobody wants to do by hand',
  'One screen instead of six tabs',
  'Set it up once',
  'Made for people who post daily',
  'Your week, already organised',
  'Quietly does the paperwork',
] as const

const NAME_HEADS = [
  'Reach',
  'Signal',
  'Ledger',
  'Cadence',
  'Beacon',
  'Harbour',
  'Quill',
  'Lantern',
  'Compass',
  'Anchor',
] as const
const NAME_TAILS = ['ly', 'wise', 'board', 'deck', 'lab', 'works', 'kit', 'flow'] as const
const DEV_HEADS = [
  'Northbeam',
  'Tidewater',
  'Quarterlight',
  'Foundry',
  'Meridian',
  'Sandpiper',
  'Ridgeline',
  'Copperline',
] as const
const DEV_TAILS = ['Labs', 'Software', 'Studio', 'Systems', 'Digital', 'Tools'] as const
const TLDS = ['io', 'app', 'dev', 'co', 'tools', 'studio'] as const

/** 1.6 violations rotate through these: plain, digit-swapped and separated spellings. */
const COMPETITOR_MENTIONS = [
  'OnlyFans',
  '0nlyFans',
  'only.fans',
  'Only Fans',
  'Fansly',
  'Fans1y',
  'fans-ly',
  'Patreon',
  'LoyalFans',
  'ManyVids',
  'JustForFans',
  'Just.For.Fans',
] as const

/** 6.2 parking and site-builder placeholders, one per host the doc names. */
const PLACEHOLDER_URLS = [
  (slug: string) => `https://${slug}.parkingcrew.net`,
  (slug: string) => `https://${slug}.sedoparking.com`,
  (slug: string) => `https://www.afternic.com/forsale/${slug}.io`,
  (slug: string) => `https://${slug}.godaddysites.com`,
  (slug: string) => `https://${slug}.wixsite.com/home`,
] as const

/** Mixes the index into an unrelated-looking number, so slot choices do not move in step. */
function scramble(index: number, slot: number): number {
  let value = (index + 1) * 2654435761 + (slot + 1) * 40503
  value ^= value >>> 13
  value = (value * 1274126177) >>> 0
  return value ^ (value >>> 16)
}

const cycle = <T>(bank: readonly [T, ...T[]], position: number): T => bank[position % bank.length] ?? bank[0]

const pick = <T>(bank: readonly [T, ...T[]], index: number, slot: number): T =>
  cycle(bank, Math.abs(scramble(index, slot)))

const hex = (value: number, length: number) => value.toString(16).padStart(length, '0')
const capitalise = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`

function generatedListing(index: number): AppListing {
  const serial = String(index + 1).padStart(4, '0')
  const name = `${pick(NAME_HEADS, index, 1)}${pick(NAME_TAILS, index, 2)} ${serial}`
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const developerName = `${pick(DEV_HEADS, index, 3)} ${pick(DEV_TAILS, index, 4)}`

  // Five clauses, rotated so two listings that happen to share a clause do not
  // share the sentence around it.
  const clauseCount = 5
  const rotation = Math.abs(scramble(index, 99)) % clauseCount
  const ordered = (position: number) => {
    const slot = (rotation + position) % clauseCount
    return `${pick(VERBS, index, 10 + slot)} ${pick(NOUNS, index, 20 + slot)}`
  }
  const outcome = `${pick(OUTCOME_HEADS, index, 5)} ${pick(OUTCOME_TAILS, index, 6)}`
  const secondOutcome = `${pick(OUTCOME_HEADS, index, 15)} ${pick(OUTCOME_TAILS, index, 16)}`

  const sentence = [1, 2, 3, 4].reduce(
    (text, position, slot) => `${text}${pick(JOINERS, index, 30 + slot)}${ordered(position)}`,
    capitalise(ordered(0)),
  )

  const basePrice = 799 + (index % 40) * 100
  const plans: PricingPlan[] = [
    {
      billingType: 'recurring',
      currencyCode: 'USD',
      description: `${capitalise(ordered(0))} for one account.`,
      highlights: [ordered(0), ordered(1)],
      interval: 'monthly',
      name: 'Standard',
      price: basePrice,
      status: 'active',
      uuid: `${hex(index + 1, 8)}-1a11-4b22-8c33-${hex(index + 1, 12)}`,
    },
  ]

  // 3.3: a plan priced outside the supported range, alternately above and below it.
  if (index % 37 === 0) {
    const below = (index / 37) % 2 === 1
    plans.push({
      billingType: 'recurring',
      currencyCode: 'USD',
      description: below ? 'One account, the basics.' : 'Every account you manage, one bill.',
      highlights: [ordered(2), ordered(3)],
      interval: 'monthly',
      name: below ? 'Starter' : 'Agency',
      price: below ? 299 : 62500,
      status: 'active',
      uuid: `${hex(index + 1, 8)}-2a11-4b22-8c33-${hex(index + 1, 12)}`,
    })
  }

  // 1.6: the tagline names a competing platform, sometimes disguised.
  const tagline =
    index % 31 === 0
      ? `${capitalise(ordered(1))} for creators moving over from ${pick(COMPETITOR_MENTIONS, index, 7)}`
      : `${capitalise(ordered(1))} without the spreadsheet`

  const description = `${capitalise(ordered(2))} and ${ordered(3)}, for anyone whose ${secondOutcome}.`

  // 2.1: draft copy left in the description, or (every other time) no highlights at all.
  const draft = index % 43 === 0 && (index / 43) % 2 === 0
  const noHighlights = index % 43 === 0 && !draft
  const descriptionBody = `${draft ? 'TODO: tighten this copy before launch. ' : ''}${name} ${sentence}, until ${outcome}.`

  // 6.2: plain HTTP, an IP address, Fanvue's own domain, a parking or
  // site-builder host, no URL at all, or a URL with no host.
  let appUrl: string | null = `https://${slug}.${pick(TLDS, index, 8)}`
  if (index % 23 === 0) {
    appUrl = cycle(
      [
        `http://${slug}.${pick(TLDS, index, 8)}`,
        `https://203.0.113.${(index / 23) % 250}/${slug}`,
        `https://fanvue.com/apps/${slug}`,
      ],
      (index / 23) % 3,
    )
  }
  if (index % 29 === 0) {
    appUrl = cycle(PLACEHOLDER_URLS, (index / 29) % PLACEHOLDER_URLS.length)(slug)
  }
  if (index % 41 === 0) {
    appUrl = (index / 41) % 2 === 0 ? null : `/apps/${slug}`
  }

  // 2.3: the same screenshot listed twice.
  const previewImageUrls =
    index % 17 === 0
      ? [`https://placehold.co/800x500/png?text=${slug}+1`, `https://placehold.co/800x500/png?text=${slug}+1`]
      : [`https://placehold.co/800x500/png?text=${slug}+1`, `https://placehold.co/800x500/png?text=${slug}+2`]

  return {
    appUrl,
    description,
    descriptionBody,
    descriptionTitle: pick(TITLES, index, 9),
    developer: { handle: developerName.toLowerCase().replace(/[^a-z0-9]/g, '-'), name: developerName },
    galleryImageUrls: [`https://placehold.co/1280x800/png?text=${slug}+gallery`],
    heroImageUrl: `https://placehold.co/1200x630/png?text=${slug}`,
    highlights: noHighlights ? [] : [ordered(0), ordered(1), ordered(2)],
    logoUrl: `https://placehold.co/256x256/png?text=${serial}`,
    name,
    previewImageUrls,
    pricingPlans: plans,
    pricingType: 'monthly',
    rating: index % 5 === 0 ? { average: null, count: null } : { average: 3.5 + (index % 15) / 10, count: index % 400 },
    ratingDistribution: null,
    tagline,
    uuid: `${hex(index + 1, 8)}-0a11-4b22-8c33-${hex(index + 1, 12)}`,
  }
}

export const GENERATED_LISTING_COUNT = 2000

export const generatedListings: AppListing[] = Array.from({ length: GENERATED_LISTING_COUNT }, (_unused, index) =>
  generatedListing(index),
)
