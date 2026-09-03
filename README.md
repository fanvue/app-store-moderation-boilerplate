# Fanvue product engineer session: App Store listing moderation

A one-hour pairing session: you build a moderation UI where a Fanvue moderator can see every App Store listing and its status at a glance, checked against the public Listing Requirements, while Simon watches and asks questions.

- [The task](#the-task)
- [Where to work](#where-to-work)
- [Rules of the game](#rules-of-the-game)
- [The hour](#the-hour)
- [What we look for](#what-we-look-for)
- [Share your work](#share-your-work)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Field glossary](#field-glossary)
- [Project map and mock API](#project-map-and-mock-api)
- [Stack and license](#stack-and-license)

## The task

Fanvue is a platform where creators publish content and earn from subscribers. The Fanvue App Store lets third-party developers list apps for those creators, and every listing must meet the public Listing Requirements before it goes live; today a human checks each one.

You build the tool that moderator uses: one screen that lists every app with its status (reject, needs fix, warning, clean, or not yet checked), worst first, and a listing page that says which rule fired and where. The repo gives you a bare skeleton: a plain table of apps and a plain dump of each listing, with `TODO` markers where the status, the ordering and the findings go. Both call `validateListing(listing)`, which today returns nothing. Implement the rules a program can decide from the listing data alone in `src/lib/moderation/rules.ts`, prove them with tests in `src/lib/moderation/rules.test.ts`, then build the queue the moderator needs.

**Done means a moderator could use it: at least two rules with tests you saw fail before they passed, every app showing a status, rejects at the top of the queue, and "No findings" told apart from "Not checked".** More rules are welcome, but a moderator who can trust two well-tested rules beats six they cannot.

## Where to work

| File                               | What to do there                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `src/lib/moderation/rules.ts`      | Implement `validateListing`. It returns `Issue[]`                                |
| `src/lib/moderation/rules.test.ts` | Your tests. Two `it.todo` placeholders to replace                                |
| `src/components/ReviewQueue.tsx`   | Skeleton of the moderator's queue. Follow the `TODO`s: status per app, worst first |
| `src/components/FindingsList.tsx`  | Skeleton of how findings show on the listing page. Make it useful to a moderator |
| `ASSUMPTIONS.md`                   | Anything you decided that the doc does not say                                   |
| `docs/listing-requirements.md`     | The spec. Start with the "Common rejection reasons" table at the bottom          |
| `docs/pricing-plans.md`            | Source of the $3.99 to $500 price range for paid plans                           |
| `src/lib/fanvue/types.ts`          | The listing shape. The [Field glossary](#field-glossary) explains the image and price fields |
| `fixtures/listings.ts`             | The sample listings the UI shows                                                 |

## Rules of the game

- Each `Issue` cites a rule number from the doc (for example `2.3`) and a severity: `reject`, `fix` or `warn`. You decide what each severity means and must be able to justify it.
- Only rules a program can decide from the listing data alone.
- Out of scope: anything needing a human eye (image quality, originality, NSFW, interface quality, whether a description is "clear"), typos and grammar, fetching URLs.
- Anything not explicit in the docs (word lists, limits, interpretations) is an assumption. Write it in `ASSUMPTIONS.md` and emit it as `warn`.
- Build for the moderator. The queue is the product: can they see every app's status at a glance and clear it quickly, and does the listing page tell them what to decide? Visual polish is not assessed; whether a moderator can act on the screen is.
- If time remains: link each finding to its anchor in the doc, filter the queue by status, or anything else you think a moderator needs. Plain HTML is fine; `@fanvue/ui` is installed if you want it.

## The hour

| Time      | What happens                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| 0-10 min  | Hello, get the repo running, tour of the files                                                                   |
| 10-20 min | You read the "Common rejection reasons" table, then say which rules you can automate and what severity each gets |
| 20-45 min | You build: rules with tests, then the queue a moderator needs                                                    |
| 45-55 min | You walk through your diff as a PR, then demo as if Simon were the moderator                                     |
| 55-60 min | Share your work                                                                                                  |

Simon will interrupt with questions; that is the format. Use your AI tool as much as you like. Commit before each prompt and show the diff after, so Simon can follow.

## What we look for

- You classify rules as machine-checkable or human, and check the AI's claims against the doc
- Tests seen failing before they pass
- Types match reality: `appUrl` is nullable, prices are in minor units
- You think about the moderator using the screen: what is at the top of the queue, what they see on a listing, what they do next
- Severities and queue order make sense for the moderator who acts on them
- Assumptions written down, not presented as rules
- You explain your thinking and are honest about what is unfinished

## Share your work

- A private repo from this template (green "Use this template" button on GitHub, choose Private) with GitHub user `simonstaton` invited, or a zip of the folder
- Never fork or open a pull request: the repo is public, so your work would be too
- Include a few lines on what is done, what is not, and what you would do next, plus `ASSUMPTIONS.md`

## Quick start

No prep needed, and no Fanvue account or credentials. Setup happens together in the first 10 minutes of the call.

- Node.js 24: `nvm install 24` or `fnm install 24` (`.nvmrc` is set). Node 22 prints an engine warning but works. Windows works natively; on WSL, clone inside `~/`, not `/mnt/c`.
- pnpm via corepack: `corepack enable`, and answer `y` if the first `pnpm` command asks to download pnpm. If `corepack` is not found or errors, run `npm i -g pnpm@10` instead.

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
pnpm install
pnpm dev
```

- Open http://localhost:3000. The first page compile takes 10 to 20 s. Every listing shows "Not checked" until rules exist.
- Harmless noise: images are placehold.co placeholders, so they break offline (nothing else needs the network); `npm` or `npx` prints `Unknown project config "auto-install-peers"`, a pnpm-only `.npmrc` setting.

## Scripts

`pnpm dev` (dev server on port 3000), `pnpm build` and `pnpm start` (production build and serve), `pnpm test` (Vitest, once) and `pnpm test:watch`, `pnpm typecheck` (`tsc --noEmit`), `pnpm lint` (ESLint with Next.js and TypeScript rules).

## Field glossary

| Field                  | Meaning                                                  |
| ---------------------- | -------------------------------------------------------- |
| `previewImageUrls`     | The listing's screenshots                                |
| `galleryImageUrls`     | Thumbnails beside the hero. Not counted as screenshots   |
| `heroImageUrl`         | Banner at the top of the listing                         |
| `logoUrl`              | The app icon                                             |
| `pricingPlans[].price` | Minor currency units (cents for USD)                     |

## Project map and mock API

```
app/page.tsx                      Review queue (/)
app/listings/[uuid]/page.tsx      Listing detail (/listings/:uuid)
app/api/v0/apps/                  Mock GET /v0/apps and /v0/apps/{uuid}
src/components/                   ReviewQueue, ListingDetail, FindingsList, Header
src/lib/fanvue/                   types.ts (AppListing) and api.ts (listApps, getApp, getAllApps)
src/lib/moderation/               rules.ts (validateListing) and rules.test.ts
fixtures/listings.ts              15 synthetic listings typed as AppListing[]
docs/                             Vendored requirements doc, pricing doc and OpenAPI excerpt
```

Mock API: the UI reads through `src/lib/fanvue/api.ts` over `fixtures/listings.ts`. The same functions are served at `/api/v0/apps` and `/api/v0/apps/{uuid}`, mirroring the live API shape. The task does not need it.

## Stack and license

Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, [`@fanvue/ui`](https://github.com/fanvue/fanv-ui) ([Storybook](https://main--697a1b6dd4dad73ee9c0e5f5.chromatic.com/); offline, `node_modules/@fanvue/ui/dist/index.d.ts` has the component props once `pnpm install` has run), Vitest, ESLint. MIT license, see [`LICENSE`](LICENSE).
