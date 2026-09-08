# Fanvue product engineer session: App Store listing moderation

This is a one-hour pairing session. You build the screen a Fanvue moderator uses to check App Store listings against the public Listing Requirements, and the interviewer watches and asks questions as you go.

- [The task](#the-task)
- [Rules of the game](#rules-of-the-game)
- [Where to work](#where-to-work)
- [The hour](#the-hour)
- [What we look for](#what-we-look-for)
- [Hand your code over](#hand-your-code-over)
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

1. Read the [Common rejection reasons](docs/listing-requirements.md#common-rejection-reasons) table at the top of the requirements doc. Pick a rule a program can check.
2. Write a test for it in `rules.test.ts`. Run `pnpm test:watch` and watch it fail.
3. Implement it in `rules.ts` and watch it pass. Repeat for a second rule.
4. Fill in `queue.ts` and `src/components/ReviewQueue.tsx` until the queue shows a status per listing, worst first.

**Done means `pnpm test` is green and a moderator could use the queue: the acceptance tests pass untouched, each rule has a test you saw fail before it passed, and "No findings" is told apart from "Not checked".** More rules are welcome, but a moderator who can trust two well-tested rules beats six they cannot.

## Rules of the game

- Every finding is an `Issue` (see `src/lib/moderation/rules.ts`): the rule it breaks, a severity, and a message.
- **Rule numbers are section headings.** A rule is one numbered section of `docs/listing-requirements.md`. The heading `2.3 Listing quality` is rule `2.3`, so a finding about it sets `rule: "2.3"`. The [Common rejection reasons](docs/listing-requirements.md#common-rejection-reasons) table at the top of the doc has a Section column that links straight to each heading.
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

Two more files come into it. `src/lib/moderation/queue.ts` holds stubs of `worstSeverity` and `sortQueue` that the queue needs. `src/components/FindingsList.tsx` decides how findings look on the listing page, and no test covers it, so make it useful and show it in the demo.

Never edit the three `*.acceptance.test.*` files. They are red today and they define done.

The rest is reading. `docs/listing-requirements.md` is the spec, and the [Common rejection reasons](docs/listing-requirements.md#common-rejection-reasons) table at the top of it is where to start. `docs/pricing-plans.md` is the source of the $3.99 to $500 price range for paid plans. `src/lib/fanvue/types.ts` is the listing shape, explained by the [Field glossary](#field-glossary). `fixtures/listings.ts` holds the sample listings that both the UI and the acceptance tests use.

## The hour

| Time      | What happens                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 0-8 min   | Hello, get the repo running, quick tour                                                                                                  |
| 8-16 min  | You read the [Common rejection reasons](docs/listing-requirements.md#common-rejection-reasons) table and answer the four questions below |
| 16-46 min | You build: first rule with its test, then the queue, then a second rule                                                                  |
| 46-54 min | You walk through your diff as if it were a pull request, then demo with the interviewer as the moderator                                 |
| 54-60 min | Hand the code over: private repo or zip, three lines on what is done, then your questions for us                                         |

In the 8-16 slot, four bullets is the whole ask. Write them in `ASSUMPTIONS.md` or a scratch file:

1. Two rows you could decide in code from the listing data alone, with the section number for each.
2. One row you would refuse to automate, and the word in it that makes it a human's job.
3. A severity for each of your two.
4. One thing you had to decide that the doc does not actually say.

Read the table, then open only the sections you picked. Three bullets when time is up is fine. Your two picks are not a commitment; change your mind while you build.

The interviewer will interrupt with questions throughout; that is the format, not a sign something is wrong. You do not need to plan for them. Spend your time on the task and answer as you go, including from a half-built screen.

Use your AI tool as much as you like. Commit before each prompt and show the diff after, so the interviewer can follow. Two rules and a queue a moderator could use is the bar, and unfinished work is normal.

## What we look for

- You separate the rules a program can check from the ones that need a human.
- You check what the AI tells you against the doc rather than taking its word for it.
- The acceptance tests pass without being edited, and each of your own tests failed before it passed.
- Your code handles the data as it really is. `appUrl` can be null, and prices are in minor units.
- The queue order and the severities make sense to the moderator who has to act on them.
- You write your assumptions down as assumptions, explain your thinking, and say what is unfinished.

## Hand your code over

Make a private repo from this template with the green "Use this template" button, choose Private, and invite the GitHub user `simonstaton`. A zip of the folder works just as well.

Do not fork the repo and do not open a pull request. This repo is public, so your work would be public too.

Add a few lines on what is done, what is not, and what you would do next, and leave `ASSUMPTIONS.md` in place.

The last few minutes are yours. Bring questions about the team, the role, or anything you noticed in the codebase.

## Quick start

There is nothing to prepare, and you do not need a Fanvue account. We get this running together at the start of the call.

You need Node.js 24, which `.nvmrc` is set to. Node 22 works but prints an engine warning. Windows is fine natively. On WSL, clone inside `~/` rather than `/mnt/c`.

For pnpm, run `corepack enable` and answer `y` if the first `pnpm` command offers to download it. If `corepack` is missing or errors, run `npm i -g pnpm@10` instead.

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
pnpm install
pnpm dev
```

Then open http://localhost:3000. The first page is slow while Next.js compiles it. Every listing says "Not checked" until you write a rule.

Two warnings you can ignore. The images come from placehold.co, so they break without a network connection, and nothing else needs one. And `npm` prints `Unknown project config "auto-install-peers"`, which is a pnpm-only setting.

## Scripts

| Script                     | What it does                    |
| -------------------------- | ------------------------------- |
| `pnpm dev`                 | Dev server on port 3000         |
| `pnpm build`, `pnpm start` | Production build, then serve it |
| `pnpm test`                | Every test, once                |
| `pnpm test:watch`          | Every test, on change           |
| `pnpm test:acceptance`     | Only the five acceptance tests  |
| `pnpm test:smoke`          | Everything except those five    |
| `pnpm typecheck`           | `tsc --noEmit`                  |
| `pnpm lint`                | ESLint                          |

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

The UI reads its data through `src/lib/fanvue/api.ts`, which sits over `fixtures/listings.ts`. The same functions are also served at `/api/v0/apps` and `/api/v0/apps/{uuid}` so the shape matches the live API. You do not need any of that for the task.

## Stack and license

Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, [`@fanvue/ui`](https://github.com/fanvue/fanv-ui) ([Storybook](https://main--697a1b6dd4dad73ee9c0e5f5.chromatic.com/); offline, `node_modules/@fanvue/ui/dist/index.d.ts` has the component props once `pnpm install` has run), Vitest, ESLint. MIT license, see [`LICENSE`](LICENSE).
