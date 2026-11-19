# Fanvue product engineer session: App Store moderation

A 60-minute pairing session. A Fanvue moderator uses this tool to check App Store listings against the [Listing Requirements](docs/listing-requirements.md). It is too slow to use, and you make it fast. The interviewer watches and asks questions as you go.

## Getting started

You need Node 24 (`nvm use` reads `.nvmrc`).

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

`npm run dev` starts the web app, a Postgres database and a background worker, so there is nothing else to install. Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings. It takes 15 to 25 seconds to load, and can take 40 seconds or more on Windows.

Then run this in a second terminal:

```bash
npm run measure
```

It prints how long each page takes and how many API calls it makes. Run it again after each change to see where you are.

Use any AI tool you like, and read what it changes before you keep it. [`AGENTS.md`](AGENTS.md) tells it how to work in this repo. You may change or delete that file.

## The task

**Apps** are web applications that creators install on Fanvue and give consent to. Developers list them in the Fanvue App Store.

**Moderators** check each listing against the Listing Requirements before it goes live. The six rules a program can check are already written: `reviewListings` in [`rules.ts`](src/lib/moderation/rules.ts) takes listings and returns the findings for each.

The tool around the rules is the problem. Both pages fetch all 2,015 listings from the Fanvue API and review them on every load, and nothing is stored.

**Make the tool fast, and keep what it shows correct when listings change.** Start by telling the interviewer how you would design it.

You have three places to build in. What goes in each is your design:

- **The webhook** in [`app/api/moderation/events/route.ts`](app/api/moderation/events/route.ts). The Fanvue API posts to it when a listing is submitted or edited.
- **The worker step** in [`src/lib/moderation/worker.ts`](src/lib/moderation/worker.ts). `npm run dev` calls it in a loop.
- **The database**, with your own tables in [`db/migrations/`](db/migrations).

The pages read what you store through `getReview` and `getQueuePage` in [`store.ts`](src/lib/moderation/store.ts). `npm run measure` calls the same two functions.

`npm run send-events` makes the API send an event for every listing. `npm run send-events -- --edit 20` edits 20 listings and sends their events.

You will not finish everything. We care more about what you choose to do, and why, than how much you finish.

## How the Fanvue API behaves

The mock API behaves like the live one in these ways:

- `GET /apps` returns at most 50 summaries a page, in submission order. It cannot filter or sort by severity or rule.
- The rules need fields from `GET /apps/{uuid}`, one call per listing.
- Every call takes about three milliseconds and is counted. The live API allows 200 calls a minute, so fetching all 2,015 listings takes about ten minutes.
- Editing a listing or a pricing plan starts a new submission. The API then sends a [webhook event](src/lib/fanvue/events.ts) with the listing's uuid and its submission number. The event does not carry the listing.
- One webhook request holds up to 100 events. The same event can arrive twice, and two events for one listing can arrive in either order.
- If the webhook does not answer with a 2xx, the API sends the request again.

## What your design has to handle

1. A listing is edited. Its stored findings follow, without fetching every listing again.
2. An edit changes another listing's findings, because [4.2](docs/listing-requirements.md#42-originality) compares listings with each other.
3. The same event arrives twice, or two events for one listing arrive in the wrong order.
4. A moderator loads the queue while the worker is busy.
5. The worker stops halfway through its work and is started again.
6. The requirements doc moves to revision 4, which changes two rules.

`npm run measure` checks the first four. Be ready to say how your design handles the last two.

## Acceptance criteria

`npm run measure` reports each of these, except the URL:

- The queue and the listing page read from your store and make no API calls.
- The most serious listings come first, across all pages.
- The page number and page size are in the URL.
- An edited listing costs one API call, however many events arrive for it.
- After the edits, the stored findings of all 2,015 listings match what the rules say.
- The queue page stays fast while the worker is busy.

`npm test` still passes. Do not edit [`spec.test.ts`](src/lib/moderation/spec.test.ts).

## Where to work

| File                                                                                                                          | What it is                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`app/api/moderation/events/route.ts`](app/api/moderation/events/route.ts)                                                    | The webhook. The mock API posts events to it                                       |
| [`src/lib/moderation/worker.ts`](src/lib/moderation/worker.ts)                                                                | One step of the worker, called in a loop by `npm run dev`                          |
| [`src/lib/moderation/store.ts`](src/lib/moderation/store.ts)                                                                  | `getReview` and `getQueuePage`, called by the pages and by `npm run measure`       |
| [`db/migrations/`](db/migrations)                                                                                             | The database schema, applied when `npm run dev` starts and by `npm run db:migrate` |
| [`db/schema.ts`](db/schema.ts)                                                                                                | The table types Kysely uses. Add a table here when you add a migration for it      |
| [`app/page.tsx`](app/page.tsx), [`app/listings/[uuid]/page.tsx`](app/listings/%5Buuid%5D/page.tsx)                            | The queue at `/` and one listing at `/listings/<uuid>`                             |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx)                                                            | The queue table, rendered by `app/page.tsx`                                        |
| [`src/components/ListingDetail.tsx`](src/components/ListingDetail.tsx), [`FindingsList.tsx`](src/components/FindingsList.tsx) | One listing and its findings, rendered by the listing page                         |
| [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts)                                                                  | The listing rules, already written. `reviewListings` is called by the pages today  |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts)                                                                  | Severity helpers                                                                   |
| [`src/lib/moderation/fetch-every-listing.ts`](src/lib/moderation/fetch-every-listing.ts)                                      | The slow fetch both pages use today                                                |

You may add new files too, such as components, modules, migrations and tests. Everything else (the fixtures, the mock API in `src/lib/fanvue/`, the scripts, the database plumbing, the spec file) is there to be read, not changed.

Your storage is Postgres, through [Kysely](https://kysely.dev). [`src/lib/db/client.ts`](src/lib/db/client.ts) gives you the database, [`db/schema.ts`](db/schema.ts) holds the table types and [`db/migrations/`](db/migrations) the migrations. [`0001_worker_heartbeat.ts`](db/migrations/0001_worker_heartbeat.ts) is the worked example.

- `npm run dev` applies migrations when it starts.
- The web app and the worker are different processes, so anything the worker has for the pages goes through the database, not memory.
- The database is [PGlite](https://pglite.dev). Statements from every connection run one at a time, and an open transaction makes the others wait.

## Commands

```bash
npm run dev           # the web app, the database and the worker
npm run measure       # page times, API calls, and how edits reach your store
npm run send-events   # an event for every listing
npm run send-events -- --edit 20   # edits 20 listings and sends their events
npm test              # the rule tests and the spec
npm run test:watch    # the same, rerun as you save
npm run db            # only the database
npm run db:migrate    # applies migrations to it
npm run db:reset      # deletes the database and the mock API's edits. Stop npm run dev first
npm run db:query -- "select * from worker_heartbeat"   # look inside the database
```
