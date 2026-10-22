# Fanvue product engineer session: App Store moderation

A 90-minute pairing session. You build a tool that a Fanvue moderator uses to check App Store listings against the [Listing Requirements](docs/listing-requirements.md). Then you design how the tool handles fan experiences. A reviewer approves each experience before fans see it, but some later changes go live with no review. The interviewer watches and asks questions as you go.

## Getting Started

On [the repository](https://github.com/fanvue/app-store-moderation-boilerplate), choose **Use this template → Create a new repository** and make it private. Add `simonstaton` as a collaborator. Do all your work in a pull request in your copy. Do not fork it. Forks are public, and pull requests to this repository are closed automatically.

You need Node 24 (`nvm use` reads `.nvmrc`).

**On Windows:** nvm for Windows does not read `.nvmrc`, so run `nvm install 24` then `nvm use 24` (fnm and Volta also work). If PowerShell says running scripts is disabled when you run `npm`, use Command Prompt or Git Bash instead, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

```bash
git clone https://github.com/yourname/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

`npm run dev` starts the web app and a Postgres database, so there is nothing else to install. Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings. It takes 15 to 25 seconds to load, and can take 40 seconds or more on Windows. Opening one listing is just as slow, because that page also fetches all 2,015 listings to show one. The footer explains why.

If you want to work on the screens before your store exists, create a file called `.env.local` in the project folder with this line, then restart `npm run dev`:

```
MOCK_API_LATENCY_MS=0
```

This removes the wait on each mock API call in the web app. The pages still make the same number of calls. Delete the file to go back to the normal speed.

Use any AI tool you like, and read what it changes before you keep it. [`AGENTS.md`](AGENTS.md) tells it how to work in this repo. You may change or delete that file.

## The task

**Apps** are web applications that creators install on Fanvue and give consent to. Developers list them in the Fanvue App Store.

**Experiences** are embedded pages that an app publishes to a creator's profile on Fanvue, such as a game or a live stream. Fans can pay inside them.

**Moderators** check both against Fanvue's requirements. Every app listing must meet the Listing Requirements before it goes live. Today a moderator checks each listing by hand. In this exercise, a reviewer approves each experience before fans see it, but some later changes go live with no review.

There are 2,015 listings in the queue. The page you just opened fetches and reviews all of them every time it loads.

**Part one: listings**

1. Read [`docs/listing-requirements.md`](docs/listing-requirements.md). Six rules can be checked from the listing data alone. A person decides the rest.
2. Implement rules in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Rule 2.3 is already done as an example. Rules must be deterministic: they use only the listing data, with no network, LLM or external API. Each finding needs a severity (`reject`, `fix` or `warn`). Choose one per rule and be ready to explain why.
3. Move the review out of the page. Write the review job in [`review-job.ts`](src/lib/moderation/review-job.ts) and the store in [`store.ts`](src/lib/moderation/store.ts). Then make [`app/page.tsx`](app/page.tsx) read one page of stored reviews. This is the core of part one. The constraints are in [How this runs in production](docs/production.md). `@fanvue/ui` is installed if you want it.
4. Optional: add moderator decisions in [`decisions.ts`](src/lib/moderation/decisions.ts).

**Part two: experiences**

1. Read [`docs/experience-requirements.md`](docs/experience-requirements.md). It sets out how experiences are reviewed in this exercise, and has five rules that catch what review misses.
2. Optional: make [the events route](app/api/moderation/events/route.ts) accept the events that `npm run replay-events` sends ([the cases it contains](docs/production.md#experiences)). Optional: implement one rule in [`experiences/rules.ts`](src/lib/moderation/experiences/rules.ts).

You choose where to start. You will not finish everything. We care more about what you choose to do, and why, than how much you finish.

## What done looks like

Two test files check your rules.

- [`spec.test.ts`](src/lib/moderation/spec.test.ts) checks the listing rules (part one). It has 15 example listings and the rules that should flag each one.
- [`experiences/spec.test.ts`](src/lib/moderation/experiences/spec.test.ts) checks the experience rules (part two). It replays the history of 12 example experiences and lists the rules that should flag each one.

```bash
npm run test:spec     # both specs. They fail today
npm run test:spec:listings     # just the listing spec
npm run test:spec:experiences  # just the experience spec
npm run test:watch    # your own tests, as you write them
npm run see-all-rule-counts  # how many listings each rule flags, out of all 2,015
npm run review        # the review job, once you have written it
npm run replay-events # posts the experience events to your dev server
npm run db:query -- "select * from review_runs"   # look inside the database
```

The specs say what must be flagged, and under which rule. They do not say how to detect it, how serious it is, or what a moderator should see. **Do not edit them.** If you think one is wrong, say so and we will talk about it.

`npm run see-all-rule-counts` runs your rules over all 2,015 listings, not just the 15 in the spec. Use it to spot a rule that flags too much. Each rule's count appears next to the expected count. Rule [4.2](docs/listing-requirements.md#42-originality) has no expected count: any 4.2 match among the generated listings is a mistake.

**The queue is the product.** One moderator works through two thousand listings, so the worst ones must come first. The queue is done when:

- Loading the page reads from your store and makes no API calls.
- The most serious listings come first, across all pages.
- The page number, page size and filters (severity, rule) are in the URL, so a moderator can share a link to a filtered view.
- A moderator can tell which listings passed every rule, which are not reviewed yet, and which a person already decided.
- The page shows when the review job last ran.
- Each finding shows which rule fired and the text that triggered it.
- Two listings flagged as duplicates of each other under 4.2 appear once, as a pair.
- The page stays fast with 2,000 listings. It does not load them all at once.

**Moderator decisions** are optional. They are done when:

- Decisions are saved in Postgres.
- Each decision records the findings the moderator saw and the revision of the requirements doc. When revision 4 arrives, earlier approvals stay approved.
- If two moderators decide the same listing, the second gets a `409` response with the first decision. You choose what the second moderator sees.
- The note sent to the developer is separate from the moderator's own notes. Think about what a 1.6 rejection note should not reveal.

## Where to work

| File                                                                                                                          | What it is                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts)                                                                  | The listing rules. `reviewListings` is called by the pages, the spec and `npm run see-all-rule-counts` |
| [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts)                                                        | Unit tests for the listing rules, run by `npm run test:watch`                                          |
| [`src/lib/moderation/review-job.ts`](src/lib/moderation/review-job.ts)                                                        | The review job, run by `npm run review`. Also holds `fetchEveryListing`, which the pages call today    |
| [`src/lib/moderation/store.ts`](src/lib/moderation/store.ts)                                                                  | The review store the job writes and the pages read. Interface only                                     |
| [`db/migrations/`](db/migrations)                                                                                             | The database schema, applied when `npm run dev` starts and by `npm run db:migrate`                     |
| [`src/lib/moderation/decisions.ts`](src/lib/moderation/decisions.ts)                                                          | Moderator decisions, called by the decisions route                                                     |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts)                                                                  | Severity helpers. `SEVERITY_ORDER` is used by `npm run see-all-rule-counts`                            |
| [`app/page.tsx`](app/page.tsx), [`app/listings/[uuid]/page.tsx`](app/listings/%5Buuid%5D/page.tsx)                            | The queue at `/` and one listing at `/listings/<uuid>`                                                 |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx)                                                            | The queue table, rendered by `app/page.tsx`                                                            |
| [`src/components/ListingDetail.tsx`](src/components/ListingDetail.tsx), [`FindingsList.tsx`](src/components/FindingsList.tsx) | One listing and its findings, rendered by the listing page                                             |
| [`app/api/moderation/`](app/api/moderation)                                                                                   | The decisions route and the events route that `npm run replay-events` posts to                         |
| [`src/lib/moderation/experiences/rules.ts`](src/lib/moderation/experiences/rules.ts)                                          | The experience rules. `reviewEvents` is called by the experience spec                                  |
| [`src/lib/moderation/experiences/rules.test.ts`](src/lib/moderation/experiences/rules.test.ts)                                | Unit tests for the experience rules, run by `npm run test:watch`                                       |

You may add new files too, such as components, modules, migrations and tests. Everything else (the fixtures, the mock API, the database plumbing, the types, the two spec files) is there to be read, not changed.
