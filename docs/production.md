# How this runs in production

The fixtures are here so the repo works offline. The mock API behaves like the real one in the ways that matter, and this page lists every one of them.

## Listings

- `GET /apps` returns at most 50 summaries a page. The fields the rules need come from `GET /apps/{uuid}`, one call per listing. Fetching everything is 41 list calls and 2,015 detail calls.
- Every mock call takes about three milliseconds, as a stand-in for a round trip, and every call is counted. The queue footer shows both.
- The live API allows 200 calls a minute. The mock does not enforce that, but at that rate fetching everything takes about ten minutes. Nothing that runs on a page load can do it, and nothing should.
- `GET /apps` is in submission order and cannot filter by severity or rule. Worst first across pages has to come from an index you keep.
- Editing a listing or a pricing plan starts a new submission, and a webhook says so. Listings are reviewed again after every edit. Rule [4.2](listing-requirements.md#42-originality) compares listings to each other, so one edit can change another listing's findings.
- The requirements doc is on revision 3. Revision 4 changes a word list and a price ceiling next quarter. Decisions made under revision 3 stay made.

## Storage

- Your storage is Postgres. [`src/lib/db/client.ts`](../src/lib/db/client.ts) is the pool, [`db/migrations/`](../db/migrations) is the schema, and [`0001_review_runs.sql`](../db/migrations/0001_review_runs.sql) is the worked example. Migrations are applied when `npm run dev` starts.
- `npm run db` starts the database on its own, for running the job without the web server; `npm run db:migrate` then applies the migrations. `npm run db:reset` deletes the database; stop `npm run dev` first.
- `npm run review` and `npm run dev` are different processes, so anything the job writes for the page to read goes through the database, not memory.
- The database is [PGlite](https://pglite.dev) behind a Postgres socket, with its files under `data/pg`. Statements from every connection run one at a time, and an open transaction makes the others wait.

## Experiences

- Experiences arrive as events: published, updated and reported, at least once each, in order per experience. Every event carries the whole experience as it then is.
- A review that only runs on publish never sees a report.
- [`getAllExperiences()`](../src/lib/fanvue/api.ts) stands in for a one-off backfill of what is already live, and returns the end state of the replay below. It is not how new experiences arrive.

`npm run replay-events` posts the event sequence in [`fixtures/experience-events.ts`](../fixtures/experience-events.ts) to your dev server. Each experience is first published as it was on the day, with no reports, and later changes and reports arrive as their own events. These cases are there on purpose:

- Private Q&A is published clean, then updated to add the line that breaks [E3](experience-requirements.md#e3-no-off-platform-payment). The first review finds nothing; the second must.
- The second Tip Jar Royale arrives four minutes after the first, from the same app on the same profile, under a new id. [E5](experience-requirements.md#e5-no-duplicates-on-a-profile) cannot be decided from either event alone.
- Spin the Wheel and Trivia Tuesday each get an update that changes nothing a rule looks at. It should not count as a change: nothing new to store, notify or re-queue.
- `evt-0009`, the second Tip Jar Royale's publish, is delivered twice.
- Late Night Stream crosses the [E6](experience-requirements.md#e6-report-escalation) bar from reports that arrive about six weeks after it went live.
