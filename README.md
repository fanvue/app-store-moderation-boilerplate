# Fanvue product engineer session: App Store listing moderation

A one-hour pairing session: you build a moderation UI where a Fanvue moderator can see every App Store listing and its status at a glance, checked against the public Listing Requirements, while the interviewer watches and asks questions.

- [The task](#the-task)
- [Rules of the game](#rules-of-the-game)
- [Where to work](#where-to-work)
- [The hour](#the-hour)
- [What we look for](#what-we-look-for)
- [Share your work](#share-your-work)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Field glossary](#field-glossary)
- [Project map and mock API](#project-map-and-mock-api)
- [Stack and license](#stack-and-license)

## The task

Fanvue is a platform where creators publish content and earn from subscribers. The Fanvue App Store lets third-party developers list apps for those creators. Every listing must meet the public Listing Requirements before it goes live, and today a human moderator checks each one by hand.

You build the tool that moderator uses. The queue lists every listing with its status, worst first. The listing page says which rule a listing breaks and on which field.

### How the pieces fit

`validateListing` in `src/lib/moderation/rules.ts` takes one listing and returns its findings. Each finding names the rule the listing breaks and how serious it is. The queue at `/` calls that function for every listing and shows the results, worst first, using the helpers in `src/lib/moderation/queue.ts`.

The three `*.acceptance.test.*` files are ours. They already call `validateListing` and render the queue, they fail today, and you never edit them. `src/lib/moderation/rules.test.ts` is yours: one test per rule you write. Those are the only tests you write.

Build in this order:

1. Read the "Common rejection reasons" table at the bottom of `docs/listing-requirements.md`. Pick a rule a program can check.
2. Write a test for it in `rules.test.ts`. Run `pnpm test:watch` and watch it fail.
3. Implement it in `rules.ts` and watch it pass. Repeat for a second rule.
4. Fill in `queue.ts` and `src/components/ReviewQueue.tsx` until the queue shows a status per listing, worst first.

**Done means `pnpm test` is green and a moderator could use the queue: the acceptance tests pass untouched, each rule has a test you saw fail before it passed, and "No findings" is told apart from "Not checked".** More rules are welcome, but a moderator who can trust two well-tested rules beats six they cannot.

## Rules of the game

- Every finding is an `Issue` (see `src/lib/moderation/rules.ts`): the rule it breaks, a severity, and a message.
- **Rule numbers are section headings.** A rule is one numbered section of `docs/listing-requirements.md`. The heading `2.3 Listing quality` is rule `2.3`, so a finding about it sets `rule: "2.3"`. The "Common rejection reasons" table at the bottom of the doc has a Section column linking to each heading.
- **Severity says who acts next.** `reject`: the listing cannot go live as it is. `fix`: the developer can correct it without anyone's judgement. `warn`: a human should look. Pick one per rule and be ready to say why. Argue for a different scheme if you prefer one, and write it down.
- Only rules a program can decide from the listing data alone.
- Out of scope: anything needing a human eye (image quality, originality, NSFW, interface quality, whether a description is "clear"), typos and grammar, fetching URLs.
- Anything not explicit in the docs (word lists, limits, interpretations) is an assumption. Write it in `ASSUMPTIONS.md`, and default any finding that rests on one to `warn`.
- Build for the moderator. The queue is the product: can they see every app's status at a glance and clear it quickly, and does the listing page tell them what to decide? Visual polish is not assessed; whether a moderator can act on the screen is.
- If time remains: link each finding to its anchor in the doc, filter the queue by status, or anything else you think a moderator needs. Plain HTML is fine; `@fanvue/ui` is installed if you want it.

## Where to work

Four files to edit:

| File                               | What to do there                                                  |
| ---------------------------------- | ----------------------------------------------------------------- |
| `src/lib/moderation/rules.ts`      | Implement `validateListing`. It returns `Issue[]`                 |
| `src/lib/moderation/rules.test.ts` | Your own tests, one per rule                                      |
| `src/components/ReviewQueue.tsx`   | The moderator's queue. Its acceptance test says what it must show |
| `ASSUMPTIONS.md`                   | Anything you decided that the doc does not say                    |

Two more are in play: `src/lib/moderation/queue.ts` holds stubs of `worstSeverity` and `sortQueue` that the queue needs, and `src/components/FindingsList.tsx` is how findings show on the listing page. No test covers `FindingsList`, so make it useful and show it in the demo.

Never edit the three `*.acceptance.test.*` files. They are red today and they define done.

To read: `docs/listing-requirements.md` is the spec, and the "Common rejection reasons" table at the bottom is where to start. `docs/pricing-plans.md` is the source of the $3.99 to $500 price range for paid plans. `src/lib/fanvue/types.ts` is the listing shape, explained by the [Field glossary](#field-glossary). `fixtures/listings.ts` holds the sample listings that both the UI and the acceptance tests use.

## The hour

| Time      | What happens                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| 0-10 min  | Hello, get the repo running, tour of the files                                                                   |
| 10-20 min | You read the "Common rejection reasons" table, then say which rules you can automate and what severity each gets |
| 20-45 min | You build: rules with tests, then the queue a moderator needs                                                    |
| 45-55 min | You walk through your diff as a PR, then demo as if the interviewer were the moderator                           |
| 55-60 min | Share your work                                                                                                  |

The interviewer will interrupt with questions; that is the format. Use your AI tool as much as you like. Commit before each prompt and show the diff after, so the interviewer can follow.

## What we look for

- You classify rules as machine-checkable or human, and check the AI's claims against the doc
- Acceptance tests turned green honestly, and your own rule tests seen failing before they pass
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

`pnpm dev` (dev server on port 3000), `pnpm build` and `pnpm start` (production build and serve), `pnpm test` (Vitest, everything, once) and `pnpm test:watch`, `pnpm test:acceptance` (only the five acceptance tests) and `pnpm test:smoke` (everything else), `pnpm typecheck` (`tsc --noEmit`), `pnpm lint` (ESLint with Next.js and TypeScript rules).

## Field glossary

| Field                  | Meaning                                                |
| ---------------------- | ------------------------------------------------------ |
| `previewImageUrls`     | The listing's screenshots                              |
| `galleryImageUrls`     | Thumbnails beside the hero. Not counted as screenshots |
| `heroImageUrl`         | Banner at the top of the listing                       |
| `logoUrl`              | The app icon                                           |
| `pricingPlans[].price` | Minor currency units (cents for USD)                   |

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
