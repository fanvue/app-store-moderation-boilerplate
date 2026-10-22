# How this runs in production

The fixtures are here so the repo works offline. The mock API behaves like the real one in the ways that matter, and these are all of them.

## Listings

- `GET /apps` returns at most 50 summaries a page. The fields the rules need come from `GET /apps/{uuid}`, one call per listing: 41 list calls and 2,015 detail calls for everything.
- Every call takes about three milliseconds and is counted. The live API allows 200 calls a minute, so fetching everything takes about ten minutes. Nothing on a page load can do that.
- `GET /apps` is in submission order and cannot filter by severity or rule. Worst first across pages has to come from an index you keep.
- Editing a listing or a pricing plan starts a new submission, and a webhook says so. Listings are reviewed again after every edit, and because [4.2](listing-requirements.md#42-originality) compares listings to each other, one edit can change another listing's findings.
- The requirements doc is on revision 3. Revision 4 changes a word list and a price ceiling next quarter. Decisions made under revision 3 stay made.

## Storage

- Your storage is Postgres. [`src/lib/db/client.ts`](../src/lib/db/client.ts) is the pool and [`db/migrations/`](../db/migrations) is the schema, with [`0001_review_runs.sql`](../db/migrations/0001_review_runs.sql) as the worked example. `npm run dev` applies migrations when it starts.
- `npm run review` and `npm run dev` are different processes, so anything the job writes for the page goes through the database, not memory.
- `npm run db` starts the database alone, and `npm run db:migrate` applies migrations to it. `npm run db:reset` deletes it; stop `npm run dev` first.
- The database is [PGlite](https://pglite.dev): statements from every connection run one at a time, and an open transaction makes the others wait.

## Experiences

Experiences arrive as events: published, updated and reported, at least once each, in order per experience. Every event carries the whole experience as it then is, so a review that only runs on publish never sees a report. [`getAllExperiences()`](../src/lib/fanvue/api.ts) stands in for a one-off backfill and returns the end state of the replay below.

`npm run replay-events` posts the events in [`fixtures/experience-events.ts`](../fixtures/experience-events.ts) to your dev server. Each experience is first published as it was on the day, with no reports. These cases are there on purpose:

- Private Q&A is published clean, then updated into an [E3](experience-requirements.md#e3-no-off-platform-payment) violation.
- A second Tip Jar Royale arrives four minutes after the first, same app and profile, new id. [E5](experience-requirements.md#e5-no-duplicates-on-a-profile) cannot be decided from either event alone.
- Spin the Wheel and Trivia Tuesday each get an update that changes nothing a rule looks at. That is not a change: nothing new to store, notify or re-queue.
- `evt-0009` is delivered twice.
- Late Night Stream crosses the [E6](experience-requirements.md#e6-report-escalation) bar about six weeks after it went live.
