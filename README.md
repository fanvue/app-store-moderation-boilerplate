# Fanvue product engineer session: App Store moderation

A 60-minute pairing session. You build a tool that a Fanvue moderator uses to check App Store listings against the [Listing Requirements](docs/listing-requirements.md). The interviewer watches and asks questions as you go.

## Getting started

You need Node 24 (`nvm use` reads `.nvmrc`).

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

`npm run dev` starts the web app and a Postgres database, so there is nothing else to install. Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings. It takes 15 to 25 seconds to load, and can take 40 seconds or more on Windows. Opening one listing is just as slow, because that page also fetches all 2,015 listings to show one. The footer explains why.

We add simulated latency to slow down requests. To disable it, put this line in a file called `.env.local` in the project folder and restart `npm run dev`:

```
MOCK_API_LATENCY_MS=0
```

Use any AI tool you like, and read what it changes before you keep it. [`AGENTS.md`](AGENTS.md) tells it how to work in this repo. You may change or delete that file.

## The task

**Apps** are web applications that creators install on Fanvue and give consent to. Developers list them in the Fanvue App Store.

**Moderators** check them against Fanvue's requirements. Every app listing must meet the Listing Requirements before it goes live. Today a moderator checks each listing by hand.

There are 2,015 listings in the queue. The app is too slow to use today:

- The queue page fetches all 2,015 listings and reviews them on every load, then renders every row in one table.
- The listing page fetches all 2,015 listings to show one.
- Nothing is stored, so every page load repeats the work.

1. Read [`docs/listing-requirements.md`](docs/listing-requirements.md). Six rules can be checked from the listing data alone: [2.1](docs/listing-requirements.md#21-production-ready) production ready, [6.2](docs/listing-requirements.md#62-valid-owned-url) valid, owned URL, [1.6](docs/listing-requirements.md#16-no-promotion-of-other-platforms) no promotion of other platforms, [4.2](docs/listing-requirements.md#42-originality) originality, [3.3](docs/listing-requirements.md#33-pricing-accuracy) pricing accuracy and [2.3](docs/listing-requirements.md#23-listing-quality) listing quality. A person decides the rest.
2. Make the pages fast. Write the review job in [`review-job.ts`](src/lib/moderation/review-job.ts) and the store in [`store.ts`](src/lib/moderation/store.ts). Then make [`app/page.tsx`](app/page.tsx) read one page of stored reviews and [the listing page](app/listings/%5Buuid%5D/page.tsx) read one stored review. Rule 2.3 is already done as an example, so the job has findings to store before you write a rule. Run `npm run review` to fill the store. This is the core of the task. `@fanvue/ui` is installed if you want it. The mock API behaves like the live one in these ways:
   - `GET /apps` returns at most 50 summaries a page.
   - The rules need fields from `GET /apps/{uuid}`, one call per listing. Fetching everything takes 41 list calls and 2,015 detail calls.
   - Every call takes about three milliseconds and is counted.
   - The live API allows 200 calls a minute, so fetching everything takes about ten minutes. A page load cannot do that.
   - `GET /apps` is in submission order and cannot filter by severity or rule.
   - Sorting by severity across pages needs your own index.
   - Editing a listing or a pricing plan starts a new submission, and a webhook reports it.
   - Listings are reviewed again after every edit. Because [4.2](docs/listing-requirements.md#42-originality) compares listings to each other, one edit can change another listing's findings.
3. Implement one more rule in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Choose the one you think matters most to a moderator, and be ready to say why. Rules must be deterministic: they use only the listing data, with no network, LLM or external API. Each finding needs a severity (`reject`, `fix` or `warn`), and we will ask why you chose it. Run `npm run review` again to see the new findings in the queue.
4. We will ask about moderator decisions ([`decisions.ts`](src/lib/moderation/decisions.ts)) whether or not you build them. Build them only if you have time.

You will not finish everything. We care more about what you choose to do, and why, than how much you finish.

## What done looks like

[`spec.test.ts`](src/lib/moderation/spec.test.ts) checks your rules. It has 15 example listings and the rules that should flag each one. Look at the cases for the rule you chose. The rest will still fail.

```bash
npm run test:spec     # the spec. It fails today
npm run test:watch    # your own tests, as you write them. Skips the spec
```

The spec says what must be flagged, and under which rule. It does not say how to detect it, how serious it is, or what a moderator should see. **Do not edit it.** If you think a case is wrong, say so and we will talk about it.

`npm run see-all-rule-counts` runs your rules over all 2,015 listings, not just the 15 in the spec. Use it to spot a rule that flags too much. Each rule's count appears next to the expected count. Rule [4.2](docs/listing-requirements.md#42-originality) has no expected count: any 4.2 match among the generated listings is a mistake.

**The queue is the product.** One moderator works through two thousand listings, so the worst ones must come first. The queue is done when:

- Loading the queue or one listing reads from your store and makes no API calls. The queue does not load all 2,000 listings at once.
- The most serious listings come first, across all pages.
- Each finding shows which rule fired and the text that triggered it.
- The page shows when the review job last ran and under which revision of the requirements doc. It also shows which listings passed every rule and which are not reviewed yet.
- The page number and page size are in the URL, so a moderator can share a link to a page. A severity filter and a rule filter are optional.

If you implement 4.2, two listings flagged as duplicates of each other appear once, as a pair.

**Moderator decisions**, if you build them, are done when:

- Decisions are saved in Postgres, and the queue shows which listings a person already decided.
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
| [`db/schema.ts`](db/schema.ts)                                                                                                | The table types Kysely uses. Add a table here when you add a migration for it                          |
| [`src/lib/moderation/decisions.ts`](src/lib/moderation/decisions.ts)                                                          | Moderator decisions, called by the decisions route                                                     |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts)                                                                  | Severity helpers. `SEVERITY_ORDER` is used by `npm run see-all-rule-counts`                            |
| [`app/page.tsx`](app/page.tsx), [`app/listings/[uuid]/page.tsx`](app/listings/%5Buuid%5D/page.tsx)                            | The queue at `/` and one listing at `/listings/<uuid>`                                                 |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx)                                                            | The queue table, rendered by `app/page.tsx`                                                            |
| [`src/components/ListingDetail.tsx`](src/components/ListingDetail.tsx), [`FindingsList.tsx`](src/components/FindingsList.tsx) | One listing and its findings, rendered by the listing page                                             |
| [`app/api/moderation/`](app/api/moderation)                                                                                   | The decisions route                                                                                    |

You may add new files too, such as components, modules, migrations and tests. Everything else (the fixtures, the mock API, the database plumbing, the types, the spec file) is there to be read, not changed.

Your storage is Postgres, through [Kysely](https://kysely.dev). [`src/lib/db/client.ts`](src/lib/db/client.ts) gives you the database, [`db/schema.ts`](db/schema.ts) holds the table types and [`db/migrations/`](db/migrations) the migrations. [`0001_review_runs.ts`](db/migrations/0001_review_runs.ts) is the worked example.

- `npm run dev` applies migrations when it starts.
- `npm run review` and `npm run dev` are different processes, so anything the job writes for the page goes through the database, not memory.
- The database is [PGlite](https://pglite.dev). Statements from every connection run one at a time, and an open transaction makes the others wait.

## Commands

```bash
npm run dev           # the web app and the database
npm run test:spec     # the spec. It fails today
npm run test:watch    # your own tests, as you write them. Skips the spec
npm run see-all-rule-counts  # how many listings each rule flags, out of all 2,015
npm run review        # the review job, once you have written it
npm run db            # only the database
npm run db:migrate    # applies migrations to it
npm run db:reset      # deletes the database. Stop npm run dev first
npm run db:query -- "select * from review_runs"   # look inside the database
```
