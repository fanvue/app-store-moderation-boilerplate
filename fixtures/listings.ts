import type { AppListing } from "@/lib/fanvue/types";

/**
 * Synthetic App Store listings served by the mock API. Every entry is typed as
 * `AppListing`, so `pnpm typecheck` is the schema check: a typo in a field name
 * or an invalid enum value fails the build. All apps, developers and URLs are
 * made up; images are placeholders.
 */
export const listings: AppListing[] = [
  {
    uuid: "aed73a23-2c54-4c13-a79c-e8c882d1c234",
    name: "Audience Boost",
    tagline: "Grow your 0nlyFans and Fans1y faster",
    description: "Cross-post teasers from one place and see which channel brings the most new fans.",
    logoUrl: "https://placehold.co/256x256/png?text=AB",
    appUrl: "https://audienceboost.example.com",
    pricingType: "monthly",
    rating: {
      average: 3.9,
      count: 22,
    },
    developer: {
      name: "Demo Developer 01",
      handle: "demo-dev-01",
    },
    descriptionTitle: "One post, everywhere",
    descriptionBody:
      "Audience Boost is the only scheduler you need: write a teaser once, pick your channels and it publishes at the best time for each one, then shows you where new fans come from.",
    highlights: ["Cross-posting", "Per-channel growth stats", "Teaser templates"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Audience+Boost",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=audienceboost+preview+1",
      "https://placehold.co/800x500/png?text=audienceboost+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=audienceboost+screen+1",
      "https://placehold.co/1280x800/png?text=audienceboost+screen+2",
      "https://placehold.co/1280x800/png?text=audienceboost+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "d5e1afa6-ef44-460f-a08b-2beb29cf6700",
        name: "Multi",
        description: "All channels, unlimited posts.",
        billingType: "recurring",
        interval: "monthly",
        price: 1299,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited posts", "Growth stats"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 13,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 6,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 2,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 0,
      },
    ],
  },
  {
    uuid: "b15bd6d4-0a43-4208-ae90-d1e5f9804d2e",
    name: "Insight Deck",
    tagline: "Revenue and audience analytics in one dashboard",
    description: "See earnings, subscriber growth and top-performing posts at a glance, with weekly email summaries.",
    logoUrl: "https://placehold.co/256x256/png?text=ID",
    appUrl: "https://insightdeck.example.com",
    pricingType: "monthly",
    rating: {
      average: 4.7,
      count: 212,
    },
    developer: {
      name: "Demo Developer 02",
      handle: "demo-dev-02",
    },
    descriptionTitle: "Know what is working",
    descriptionBody:
      "Insight Deck pulls your earnings, subscriptions and post engagement into one dashboard, so you can spot trends early and double down on what your audience responds to.",
    highlights: ["Earnings breakdown", "Subscriber growth charts", "Top posts report", "Weekly email summary"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Insight+Deck",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=insightdeck+preview+1",
      "https://placehold.co/800x500/png?text=insightdeck+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=insightdeck+screen+1",
      "https://placehold.co/1280x800/png?text=insightdeck+screen+2",
      "https://placehold.co/1280x800/png?text=insightdeck+screen+3",
      "https://placehold.co/1280x800/png?text=insightdeck+screen+4",
    ],
    pricingPlans: [
      {
        uuid: "3df5ee50-81f9-4ee5-add7-d7855188d5cd",
        name: "Starter",
        description: "Core dashboards for one profile.",
        billingType: "recurring",
        interval: "monthly",
        price: 1499,
        currencyCode: "USD",
        status: "active",
        highlights: ["1 profile", "30-day history"],
      },
      {
        uuid: "0ca596d1-3e69-4b21-a704-5409bf04a96d",
        name: "Pro",
        description: "Full history and exports.",
        billingType: "recurring",
        interval: "monthly",
        price: 3999,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited history", "CSV export", "Priority support"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 128,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 53,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 21,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 6,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 4,
      },
    ],
  },
  {
    uuid: "ce72f881-12f0-441d-a60e-ce3aec9147ce",
    name: "Clip Cutter",
    tagline: "Trim long recordings into post-ready clips",
    description: "Upload a recording, mark the best moments and export 1:1 or vertical clips ready to post.",
    logoUrl: "https://placehold.co/256x256/png?text=CC",
    appUrl: null,
    pricingType: "monthly",
    rating: {
      average: 4.1,
      count: 39,
    },
    developer: {
      name: "Demo Developer 03",
      handle: "demo-dev-03",
    },
    descriptionTitle: "From one recording to ten posts",
    descriptionBody:
      "Clip Cutter finds silences and scene changes in your recording, suggests cut points and exports each clip in the aspect ratio you choose.",
    highlights: ["Silence detection", "Portrait and vertical export", "Batch export"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Clip+Cutter",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=clipcutter+preview+1",
      "https://placehold.co/800x500/png?text=clipcutter+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=clipcutter+screen+1",
      "https://placehold.co/1280x800/png?text=clipcutter+screen+2",
      "https://placehold.co/1280x800/png?text=clipcutter+screen+3",
      "https://placehold.co/1280x800/png?text=clipcutter+screen+4",
    ],
    pricingPlans: [
      {
        uuid: "e0259bfd-c3be-4670-a04e-b74017aa15c5",
        name: "Cutter",
        description: "Unlimited exports.",
        billingType: "recurring",
        interval: "monthly",
        price: 1199,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited clips", "1080p export"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 23,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 10,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 4,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "409b0d14-b180-4335-a038-95d08fa6a486",
    name: "Bundle Builder",
    tagline: "Package content into themed bundles",
    description: "Group posts into themed bundles with their own cover art and description.",
    logoUrl: "https://placehold.co/256x256/png?text=BB",
    appUrl: "HTTPS://Studio.Fanvue.com/app",
    pricingType: "monthly",
    rating: {
      average: 4.0,
      count: 18,
    },
    developer: {
      name: "Demo Developer 04",
      handle: "demo-dev-04",
    },
    descriptionTitle: "Curate your best work",
    descriptionBody:
      "Bundle Builder lets you pick posts, add cover art and a description, and present them as a themed collection your fans can browse.",
    highlights: ["Themed collections", "Custom cover art", "Drag-and-drop ordering"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Bundle+Builder",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=bundlebuilder+preview+1",
      "https://placehold.co/800x500/png?text=bundlebuilder+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=bundlebuilder+screen+1",
      "https://placehold.co/1280x800/png?text=bundlebuilder+screen+2",
      "https://placehold.co/1280x800/png?text=bundlebuilder+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "a262b1fe-5017-4d84-a5d7-f95eb533d800",
        name: "Curator",
        description: "Unlimited bundles.",
        billingType: "recurring",
        interval: "monthly",
        price: 899,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited bundles", "Cover art library"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 11,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 4,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 2,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 0,
      },
    ],
  },
  {
    uuid: "2630f76f-332d-4f54-a6f9-dafb0fc2b7ca",
    name: "LinkPulse",
    tagline: "Know which links bring paying fans",
    description: "Create tracked links for every channel you post on and see which ones convert to subscribers.",
    logoUrl: "https://placehold.co/256x256/png?text=L",
    appUrl: "https://linkpulse.example.com",
    pricingType: "monthly",
    rating: {
      average: 4.1,
      count: 40,
    },
    developer: {
      name: "Demo Developer 05",
      handle: "demo-dev-05",
    },
    descriptionTitle: "Track every link",
    descriptionBody:
      "LinkPulse gives you short tracked links per campaign and a simple conversions view, so you can see which promotions actually lead to subscriptions. The Starter plan is just $3/month; agencies can pick the Network plan for every profile they manage.",
    highlights: ["Tracked short links", "Conversion view", "Campaign grouping"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=LinkPulse",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=linkpulse+preview+1",
      "https://placehold.co/800x500/png?text=linkpulse+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=linkpulse+screen+1",
      "https://placehold.co/1280x800/png?text=linkpulse+screen+2",
      "https://placehold.co/1280x800/png?text=linkpulse+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "fdcf90a4-1153-4c87-a652-4df57e9474ad",
        name: "Starter",
        description: "Tracked links for one profile.",
        billingType: "recurring",
        interval: "monthly",
        price: 3,
        currencyCode: "USD",
        status: "active",
        highlights: ["1 profile", "90-day stats"],
      },
      {
        uuid: "cb9d6a19-a782-412b-a2a3-73a1c0a215fb",
        name: "Network",
        description: "Unlimited links across every profile.",
        billingType: "recurring",
        interval: "monthly",
        price: 55000,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited profiles", "Team access"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 24,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 10,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 4,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "ee2447ec-41f7-427c-af38-e446c84493b2",
    name: "Tip Ledger",
    tagline: "Simple income tracking for creators",
    description: "Track income and expenses and export a monthly summary for your accountant.",
    logoUrl: "https://placehold.co/256x256/png?text=TL",
    appUrl: "https://tipledger.example.com",
    pricingType: "monthly",
    rating: {
      average: 4.3,
      count: 55,
    },
    developer: {
      name: "Demo Developer 06",
      handle: "demo-dev-06",
    },
    descriptionTitle: "Bookkeeping without the spreadsheet",
    descriptionBody:
      "Tip Ledger categorises your income and expenses and produces a monthly PDF summary you can hand straight to your accountant.",
    highlights: ["Income and expense tracking", "Monthly PDF summary", "Upgrade via our Stripe checkout"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Tip+Ledger",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=tipledger+preview+1",
      "https://placehold.co/800x500/png?text=tipledger+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=tipledger+screen+1",
      "https://placehold.co/1280x800/png?text=tipledger+screen+2",
      "https://placehold.co/1280x800/png?text=tipledger+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "dbfe44da-13c9-4c45-ab9c-b585b6383b1f",
        name: "Pro",
        description: "Unlimited profiles. Pay by PayPal link.",
        billingType: "recurring",
        interval: "monthly",
        price: 999,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited profiles", "Priority support"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 32,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 14,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 6,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 2,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "1dadcbbd-daa2-4632-a24f-a2e8632d160b",
    name: "FanCRM Lite",
    tagline: "Keep notes and tags on your most engaged fans",
    description: "A lightweight CRM for creators: tag fans, add private notes and set follow-up reminders.",
    logoUrl: "https://placehold.co/256x256/png?text=FL",
    appUrl: "https://fancrm.example.com",
    pricingType: "free",
    rating: {
      average: 4.2,
      count: 48,
    },
    developer: {
      name: "Demo Developer 07",
      handle: "demo-dev-07",
    },
    descriptionTitle: "Remember every fan",
    descriptionBody:
      "FanCRM Lite gives you a simple card per fan with tags, notes and reminders, so you never lose track of who asked for what.",
    highlights: ["Fan tags", "Private notes", "Follow-up reminders"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=FanCRM+Lite",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=fancrm+preview+1",
      "https://placehold.co/800x500/png?text=fancrm+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=fancrm+screen+1",
      "https://placehold.co/1280x800/png?text=fancrm+screen+2",
      "https://placehold.co/1280x800/png?text=fancrm+screen+3",
    ],
    pricingPlans: [],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 29,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 12,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 5,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "6c1bbbe8-aa44-4483-a41a-45143c42ff1b",
    name: "Shoutout Studio",
    tagline: "Sell and deliver personalised shoutout videos",
    description: "Take shoutout requests with a brief, record in-app and deliver to the fan with one tap.",
    logoUrl: "https://placehold.co/256x256/png?text=SS",
    appUrl: " http://shoutoutstudio.example.com",
    pricingType: "monthly",
    rating: {
      average: 4.6,
      count: 71,
    },
    developer: {
      name: "Demo Developer 08",
      handle: "demo-dev-08",
    },
    descriptionTitle: "Shoutouts, organised",
    descriptionBody:
      "Shoutout Studio queues incoming requests with the fan's brief, lets you record and trim in the browser and delivers the finished video back to the fan.",
    highlights: ["Request queue", "In-browser recording", "One-tap delivery"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Shoutout+Studio",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=shoutoutstudio+preview+1",
      "https://placehold.co/800x500/png?text=shoutoutstudio+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=shoutoutstudio+screen+1",
      "https://placehold.co/1280x800/png?text=shoutoutstudio+screen+2",
      "https://placehold.co/1280x800/png?text=shoutoutstudio+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "6454b221-09a2-4b78-a461-49be78c47d19",
        name: "Studio",
        description: "Unlimited shoutouts.",
        billingType: "recurring",
        interval: "monthly",
        price: 1999,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited requests", "HD recording"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 43,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 18,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 7,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 2,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "b1501ce4-117c-4cd5-a82f-2bb8cb141c68",
    name: "Poll Party",
    tagline: "Run polls and let fans vote on what comes next",
    description:
      "Create quick polls, share them with your fans and see results live. Not affiliated with any other creator platform.",
    logoUrl: "https://placehold.co/256x256/png?text=PP",
    appUrl: "https://app.myfanvue.com/",
    pricingType: "free",
    rating: {
      average: 4.4,
      count: 33,
    },
    developer: {
      name: null,
      handle: "demo-dev-09",
    },
    descriptionTitle: "Let your fans decide",
    descriptionBody:
      "Poll Party gives you one-question polls with live results, so your audience can vote on themes, outfits or release dates for upcoming content.",
    highlights: ["One-tap polls", "Live results", "Result history"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Poll+Party",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=pollparty+preview+1",
      "https://placehold.co/800x500/png?text=pollparty+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=pollparty+screen+1",
      "https://placehold.co/1280x800/png?text=pollparty+screen+2",
      "https://placehold.co/1280x800/png?text=pollparty+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "b452d86d-02e5-4d28-a25d-c8620cf29bd9",
        name: "Party",
        description: "Everything, free.",
        billingType: "free",
        interval: null,
        price: 0,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited polls", "Live results"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 20,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 8,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 3,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "2dd8b767-6cd0-4e4a-a32a-225f941aff96",
    name: "Studio Ledger",
    tagline: "Bookkeeping, invoicing and tax-ready exports for creator businesses",
    description:
      "Studio Ledger is the only bookkeeping tool built around how creator income actually arrives: subscriptions, tips, pay-per-view unlocks and one-off purchases, all settled through Fanvue and reconciled automatically against your payout statements.",
    logoUrl: "https://placehold.co/256x256/png?text=SL",
    appUrl: "https://studioledger.example.com",
    pricingType: "monthly",
    rating: {
      average: 4.8,
      count: 340,
    },
    developer: {
      name: "Demo Developer 10",
      handle: "demo-dev-10",
    },
    descriptionTitle: "Every payout, explained",
    descriptionBody:
      "Studio Ledger connects to your Fanvue account with read-only access and turns each payout into an itemised statement: which of your 12 monthly renewals came in, which 3 posts were unlocked, which tips arrived and what platform fees (20% on each sale) were deducted. Nothing is estimated and nothing is entered by hand.\n\nCategorise expenses by dragging receipts onto the month they belong to, attach them to 1 shoot or 1 campaign, and let the app work out what is deductible in your country. Most creators finish a month in under 15 minutes. When tax season arrives, export a single PDF pack or a CSV your accountant can open in any spreadsheet; the Team plan keeps 7 years of history.\n\nEverything you buy in Studio Ledger, from the Solo plan to the Team plan, is purchased through Fanvue payments and shows up on your Fanvue receipt. There is no separate checkout, no card on file with us and no upcoming price change we have not announced in the app first.\n\nWe only read the data we need to build your statements. We never post on your behalf, never message your fans and never store card details. You can disconnect the platform at any time from your Fanvue settings and we delete your data within 30 days.",
    highlights: [
      "Payout reconciliation",
      "Receipt capture",
      "Country-aware deductions",
      "Accountant PDF pack",
      "Read-only access",
    ],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Studio+Ledger",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=studioledger+preview+1",
      "https://placehold.co/800x500/png?text=studioledger+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=studioledger+screen+1",
      "https://placehold.co/1280x800/png?text=studioledger+screen+2",
      "https://placehold.co/1280x800/png?text=studioledger+screen+3",
      "https://placehold.co/1280x800/png?text=studioledger+screen+4",
      "https://placehold.co/1280x800/png?text=studioledger+screen+5",
    ],
    pricingPlans: [
      {
        uuid: "80448841-c31e-4fcc-a6dc-03e865a89adc",
        name: "Solo",
        description: "One profile, unlimited statements.",
        billingType: "recurring",
        interval: "monthly",
        price: 1299,
        currencyCode: "USD",
        status: "active",
        highlights: ["1 profile", "PDF and CSV exports"],
      },
      {
        uuid: "f4c0a98b-df08-4ec6-adb5-92da3e67bed6",
        name: "Team",
        description: "Up to 10 profiles for agencies.",
        billingType: "recurring",
        interval: "monthly",
        price: 4999,
        currencyCode: "USD",
        status: "active",
        highlights: ["10 profiles", "Shared workspace", "Priority support"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 204,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 85,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 34,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 10,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 7,
      },
    ],
  },
  {
    uuid: "2375b79e-987f-423d-ac63-2d443e107a0c",
    name: "DM Autopilot",
    tagline: "Welcome messages and follow-ups that send themselves",
    description:
      "Set up a welcome message for new subscribers and timed follow-ups, all sent through your Fanvue inbox.",
    logoUrl: "https://placehold.co/256x256/png?text=DA",
    appUrl: "https://dmautopilot.example.com",
    pricingType: "free",
    rating: {
      average: 4.1,
      count: 44,
    },
    developer: {
      name: "Demo Developer 11",
      handle: "demo-dev-11",
    },
    descriptionTitle: "Never miss a hello",
    descriptionBody:
      "DM Autopilot sends your welcome message the moment someone subscribes and schedules gentle follow-ups, with a pause switch for when you want to reply in person.",
    highlights: ["Welcome messages", "Timed follow-ups", "Pause switch"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=DM+Autopilot",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=dmautopilot+preview+1",
      "https://placehold.co/800x500/png?text=dmautopilot+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=dmautopilot+screen+1",
      "https://placehold.co/1280x800/png?text=dmautopilot+screen+2",
      "https://placehold.co/1280x800/png?text=dmautopilot+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "5f2f2eb3-7840-4982-a171-37f0dec9fd90",
        name: "Autopilot",
        description: "Unlimited automations.",
        billingType: "recurring",
        interval: "monthly",
        price: 1499,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited automations", "Analytics"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 27,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 11,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 4,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "4ebce5af-1bb5-4603-af8e-ff603254e2a5",
    name: "Caption Forge",
    tagline: "AI caption drafts in your own voice",
    description: "Generate caption ideas and hooks from a few keywords, tuned to how you already write.",
    logoUrl: "https://placehold.co/256x256/png?text=CF",
    appUrl: "https://captionforge.example.com",
    pricingType: "monthly",
    rating: {
      average: 4.5,
      count: 133,
    },
    developer: {
      name: "Demo Developer 12",
      handle: "demo-dev-12",
    },
    descriptionTitle: "Write faster, sound like you",
    descriptionBody:
      "Paste a few of your past captions and Caption Forge learns your tone. Drop in a topic and get five drafts you can edit and post.",
    highlights: ["Tone matching", "Five drafts per prompt", "Hashtag suggestions", "Multilingual output"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Caption+Forge",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=captionforge+preview+1",
      "https://placehold.co/800x500/png?text=captionforge+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=captionforge+screen+1",
      "https://placehold.co/1280x800/png?text=captionforge+screen+2",
      "https://placehold.co/1280x800/png?text=captionforge+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "fd26437c-6315-4f6e-a92f-7cdf6b0406fd",
        name: "Creator Monthly",
        description: "200 drafts a month, billed monthly.",
        billingType: "recurring",
        interval: "monthly",
        price: 399,
        currencyCode: "USD",
        status: "active",
        highlights: ["200 drafts / month", "Tone profiles"],
      },
      {
        uuid: "fb451c65-9cb9-4e81-ad3e-85a84f8ac526",
        name: "Agency",
        description: "Unlimited drafts for up to 25 profiles.",
        billingType: "recurring",
        interval: "monthly",
        price: 50000,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited drafts", "25 profiles", "Shared tone library"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 80,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 33,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 13,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 4,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 3,
      },
    ],
  },
  {
    uuid: "4b217bed-d687-4f89-a973-a4f3dfbe9578",
    name: "QueueMaster",
    tagline: "Schedule posts and messages for the whole week",
    description: "Plan your posts in a drag-and-drop calendar and let QueueMaster publish them on time.",
    logoUrl: "https://placehold.co/256x256/png?text=Q",
    appUrl: "https://queuemaster.example.com",
    pricingType: "monthly",
    rating: {
      average: 4.0,
      count: 27,
    },
    developer: {
      name: "Demo Developer 13",
      handle: "demo-dev-13",
    },
    descriptionTitle: "Set it and forget it",
    descriptionBody:
      "Build a week of content on Sunday and QueueMaster posts it on schedule, with a reminder before each slot so you can make last-minute edits.",
    highlights: ["Drag-and-drop calendar", "Best-time suggestions", "Reminders"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=QueueMaster",
    previewImageUrls: ["https://placehold.co/800x500/png?text=queuemaster+preview+1"],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=queuemaster+screen+1",
      "https://placehold.co/1280x800/png?text=queuemaster+screen+2",
      "https://placehold.co/1280x800/png?text=queuemaster+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "f880181c-e1bb-417f-a0ce-684321910137",
        name: "Scheduler",
        description: "Unlimited scheduled posts.",
        billingType: "recurring",
        interval: "monthly",
        price: 899,
        currencyCode: "USD",
        status: "active",
        highlights: ["Unlimited posts", "Reminders"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 15,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 7,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 3,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 1,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 1,
      },
    ],
  },
  {
    uuid: "d9e40597-a5fd-418d-ad64-6fe617f9f3c8",
    name: "Fan Radar",
    tagline: "See which fans are most active this week",
    description:
      "Fan Radar shows which fans have engaged most with your content and tells you when someone goes quiet.",
    logoUrl: "https://placehold.co/256x256/png?text=FR",
    appUrl: "https://my-app.ngrok-free.app",
    pricingType: "monthly",
    rating: {
      average: 4.5,
      count: 96,
    },
    developer: {
      name: "Demo Developer 14",
      handle: "demo-dev-14",
    },
    descriptionTitle: "Know your community",
    descriptionBody:
      "Fan Radar ranks your fans by recent activity and highlights the ones drifting away, so you can thank your regulars and win back the quiet ones.",
    highlights: ["Active fan ranking", "Inactivity alerts", "Weekly digest"],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Fan+Radar",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=fanradar+preview+1",
      "https://placehold.co/800x500/png?text=fanradar+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=fanradar+screen+1",
      "https://placehold.co/1280x800/png?text=fanradar+screen+2",
      "https://placehold.co/1280x800/png?text=fanradar+screen+3",
      "https://placehold.co/1280x800/png?text=fanradar+screen+4",
    ],
    pricingPlans: [
      {
        uuid: "2b669bfb-47c1-456f-aa87-9785549c3b8c",
        name: "Radar",
        description: "Full fan analytics.",
        billingType: "recurring",
        interval: "monthly",
        price: 799,
        currencyCode: "USD",
        status: "active",
        highlights: ["Weekly digest", "Alerts"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 57,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 24,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 10,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 3,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 2,
      },
    ],
  },
  {
    uuid: "2935a56c-f154-4b48-a6fb-2436b281a493",
    name: "Vault Tidy",
    tagline: "Organise your media vault with smart folders",
    description:
      "Vault Tidy ordena tu biblioteca de contenido en carpetas inteligentes y detecta archivos duplicados automáticamente.",
    logoUrl: "https://placehold.co/256x256/png?text=VT",
    appUrl: "https://vaulttidy.example.com",
    pricingType: "monthly",
    rating: {
      average: 3.8,
      count: 15,
    },
    developer: {
      name: "Demo Developer 15",
      handle: "demo-dev-15",
    },
    descriptionTitle: "Smart folders for your vault",
    descriptionBody:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. TODO: write real copy",
    highlights: [],
    heroImageUrl: "https://placehold.co/1200x630/png?text=Vault+Tidy",
    previewImageUrls: [
      "https://placehold.co/800x500/png?text=vaulttidy+preview+1",
      "https://placehold.co/800x500/png?text=vaulttidy+preview+2",
    ],
    galleryImageUrls: [
      "https://placehold.co/1280x800/png?text=vaulttidy+screen+1",
      "https://placehold.co/1280x800/png?text=vaulttidy+screen+2",
      "https://placehold.co/1280x800/png?text=vaulttidy+screen+3",
    ],
    pricingPlans: [
      {
        uuid: "07d2015a-9f97-47db-a529-06f7859bb8bd",
        name: "Tidy",
        description: "Smart folders and duplicate detection.",
        billingType: "recurring",
        interval: "monthly",
        price: 699,
        currencyCode: "USD",
        status: "active",
        highlights: ["Smart folders", "Duplicate detection"],
      },
    ],
    ratingDistribution: [
      {
        rating: 5,
        proportion: 0.6,
        count: 9,
      },
      {
        rating: 4,
        proportion: 0.25,
        count: 4,
      },
      {
        rating: 3,
        proportion: 0.1,
        count: 2,
      },
      {
        rating: 2,
        proportion: 0.03,
        count: 0,
      },
      {
        rating: 1,
        proportion: 0.02,
        count: 0,
      },
    ],
  },
];
