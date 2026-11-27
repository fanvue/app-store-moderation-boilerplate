# Fanvue product engineer session: App Store moderation

A 60-minute pairing session. Moderators use this tool to check App Store listings against the [Listing Requirements](docs/listing-requirements.md). It is too slow to use. You make it fast, and keep it correct when listings change. The interviewer watches and asks questions.

## How the session goes

1. [Start the app](#getting-started). The first load is slow, so read on while it starts.
2. Read this page to the end before you write any code.
3. [Tell the interviewer your design](#the-task): what you store, what the webhook does, and how the queue pages.
4. Build it. When the pages read from your store, run `npm run measure` to check it against [what done looks like](#what-done-looks-like). We run it together at the end.

You will not finish everything. We care more about what you choose to do, and why, than how much you finish.

## Getting started

You need Node 24 (`nvm use` reads `.nvmrc`).

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev   # the web app and a Postgres database
```

Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings. The first load takes 15 to 25 seconds, or 40 seconds or more on Windows. The bottom of each page shows how many Fanvue API calls it made.

Use any AI tool you like, and read what it changes before you keep it. [`AGENTS.md`](AGENTS.md) tells it how to work in this repo. You may change or delete that file.

## The task

The listings live in the **Fanvue API**, not in this tool. Treat it as a third-party API: another team owns it, you cannot change it, and it has its own [rate limit](#how-the-fanvue-api-behaves). The repo runs a mock of it so you can work offline.

This tool stores nothing about listings. Its database has only an example table. On every load, both pages do this:

```text
page load ──► Fanvue API: list all 2,015 listings, then fetch each one ──► run the rules ──► render
```

The rules are already written: `reviewListings` in [`rules.ts`](src/lib/moderation/rules.ts).

Your job is to store the findings and make the pages read them. You build three parts:

```text
Fanvue API ──event──► your webhook ──► your tables ──► getReview, getQueuePage ──► the pages
                                                       (store.ts)                  npm run measure
```

- **The webhook** in [`route.ts`](app/api/moderation/events/route.ts). The Fanvue API posts an event to it when a listing changes. It keeps your tables up to date.
- **Your tables**, in [`db/migrations/`](db/migrations).
- **`getReview` and `getQueuePage`** in [`store.ts`](src/lib/moderation/store.ts). The pages and `npm run measure` read your tables through these two functions only, so `measure` cannot check your work until they are written.

`npm run send-events` sends an event for every listing.

Start by telling the interviewer how you would design it.

## What done looks like

`npm run measure` reports these:

1. The queue and the listing page make no API calls.
2. The queue shows the most serious listings first, across all pages.
3. An edited listing costs one API call, however many events arrive for it and in whatever order.
4. An edit that copies another listing's description flags both listings ([4.2](docs/listing-requirements.md#42-originality)). Undoing the edit clears both.
5. After the edits, the stored findings of all 2,015 listings match what the rules say.
6. The queue page stays fast while many events arrive.

`npm run measure` does not check these. Be ready to say how your design handles them:

- The page number and page size are in the URL.
- The webhook stops halfway through a request, and the API sends the request again.
- The requirements doc moves to revision 4, which changes two rules.

## How the Fanvue API behaves

The mock API behaves like the live one in these ways:

- `GET /apps` returns at most 50 summaries a page, in submission order. It cannot filter or sort by severity or rule.
- The rules need fields from `GET /apps/{uuid}`, one call per listing.
- Your code calls the API through `listApps` and `getApp` in [`api.ts`](src/lib/fanvue/api.ts). The routes under `app/api/v0/apps` wrap the same functions.
- Every call takes about three milliseconds and is counted. The live API allows 200 calls a minute, so fetching all 2,015 listings takes about ten minutes. The mock counts calls but does not block them.
- Editing a listing or a pricing plan starts a new submission. The API then sends a [webhook event](src/lib/fanvue/events.ts) with the listing's uuid and its submission number. The event does not carry the listing.
- One webhook request holds up to 100 events. The same event can arrive twice, in one request or in two, and two events for one listing can arrive in either order.
- If the webhook does not answer with a 2xx, the API sends the request again. It tries three times, then gives up on those events.

## Where to work

| File                                                                                               | What it is                                                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [`app/api/moderation/events/route.ts`](app/api/moderation/events/route.ts)                         | The webhook. The mock API posts events to it                                                     |
| [`src/lib/moderation/store.ts`](src/lib/moderation/store.ts)                                       | `getReview` and `getQueuePage`. The pages and `npm run measure` read your store through these    |
| [`db/migrations/`](db/migrations), [`db/schema.ts`](db/schema.ts)                                  | Your tables and their Kysely types. [`0001_example.ts`](db/migrations/0001_example.ts) shows how |
| [`app/page.tsx`](app/page.tsx), [`app/listings/[uuid]/page.tsx`](app/listings/%5Buuid%5D/page.tsx) | The queue at `/` and one listing at `/listings/<uuid>`                                           |

You may also change `src/components/` and the rest of `src/lib/moderation/`, and add new files. Do not edit [`spec.test.ts`](src/lib/moderation/spec.test.ts), and keep `npm test` passing. Everything else (the mock API in `src/lib/fanvue/` and `app/api/v0/`, the fixtures, the scripts, the database plumbing) is there to be read, not changed.

The database is Postgres ([PGlite](https://pglite.dev)) through [Kysely](https://kysely.dev). `npm run dev` applies migrations when it starts. Statements from every connection run one at a time, and an open transaction makes the others wait. The web app and `npm run measure` are different processes, so they share data through the database, not memory.

## Commands

```bash
npm run measure                    # with npm run dev running: page times, API calls, and how edits reach your store
npm run send-events                # an event for every listing
npm run send-events -- --edit 20   # edits 20 listings and sends their events
npm test                           # the rule tests and the spec
npm run db:reset                   # deletes the database and the mock API's edits. Stop npm run dev first
npm run db:query -- "select * from kysely_migration"   # look inside the database
```
