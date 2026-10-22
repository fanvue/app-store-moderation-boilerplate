# How this runs in production

The mock API behaves like the live one in these ways.

## Listings

- `GET /apps` returns at most 50 summaries a page.
- The rules need fields from `GET /apps/{uuid}`, one call per listing. Fetching everything takes 41 list calls and 2,015 detail calls.
- Every call takes about three milliseconds and is counted.
- The live API allows 200 calls a minute, so fetching everything takes about ten minutes. A page load cannot do that.
- `GET /apps` is in submission order and cannot filter by severity or rule.
- Sorting by severity across pages needs your own index.
- Editing a listing or a pricing plan starts a new submission, and a webhook reports it.
- Listings are reviewed again after every edit. Because [4.2](listing-requirements.md#42-originality) compares listings to each other, one edit can change another listing's findings.

## Storage

- Your storage is Postgres. [`src/lib/db/client.ts`](../src/lib/db/client.ts) is the pool, and [`db/migrations/`](../db/migrations) is the schema. [`0001_review_runs.sql`](../db/migrations/0001_review_runs.sql) is the worked example.
- `npm run dev` applies migrations when it starts.
- `npm run review` and `npm run dev` are different processes, so anything the job writes for the page goes through the database, not memory.
- `npm run db` starts only the database. `npm run db:migrate` applies migrations to it.
- `npm run db:reset` deletes the database. Stop `npm run dev` first.
- The database is [PGlite](https://pglite.dev). Statements from every connection run one at a time, and an open transaction makes the others wait.

## Experiences

Fanvue does not send these events today. For this exercise, assume it does.

Events arrive for each publish, change and report. Each arrives at least once, in order per experience. Every event carries the whole experience at that moment. [`getAllExperiences()`](../src/lib/fanvue/api.ts) is a one-off backfill that returns the final state of the replay below.

`npm run replay-events` posts the events in [`fixtures/experience-events.ts`](../fixtures/experience-events.ts) to your dev server. Each experience is published. Most are then approved and changed or reported. The replay contains these cases:

- Photography 101 lowers its monthly price while 38 fans are subscribed.
- Film Club raises its monthly price while 14 fans are subscribed ([E5](experience-requirements.md#e5-price-raised-on-paying-fans)). Zine Club raises its price with nobody subscribed.
- Private Q&A adds a paid action after approval ([E1](experience-requirements.md#e1-unreviewed-change-to-what-fans-buy)). That update is delivered twice.
- Mystery Box changes what its action sells, then a fan reports it as illegal ([E1](experience-requirements.md#e1-unreviewed-change-to-what-fans-buy), [E4](experience-requirements.md#e4-report-escalation)).
- Backstage Pass changes its cover after approval ([E2](experience-requirements.md#e2-changed-cover-not-scanned)). Lesson Pack changes its cover before it is approved.
- After Hours becomes a live stream after approval. Gym Live is a live stream served from an external site ([E3](experience-requirements.md#e3-live-content-fanvue-cannot-see)).
- Late Night Stream is reported by three fans in two days ([E4](experience-requirements.md#e4-report-escalation)). Trivia Tuesday has four reports from three fans, but never from three different fans within 7 days. One of its reports is delivered twice.
- Spin the Wheel gets an update that changes nothing a rule reads. That is not a change: nothing new to store, notify or re-queue.
