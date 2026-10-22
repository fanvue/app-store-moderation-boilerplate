# Fanvue product engineer session: App Store moderation

A 90-minute pairing session. You build the tool a Fanvue moderator uses to check App Store listings, then design how the same tool handles fan experiences. The interviewer watches and asks questions as you go.

## In two minutes

- **Part one, listings (about 60 minutes).** Write two rules, then move the review out of the page into a job and a store, so the moderator's queue reads stored results a page at a time. The job and the store are the core.
- **Part two, experiences (about 10 minutes).** Write a design in [`DESIGN.md`](DESIGN.md). Code is optional, and a design with no code beats code with no design.
- **You will not finish.** That is expected. We care more about what you choose to do and why than about how much you get through.
- **Read now:** this file down to [Part two](#part-two-experiences), and [`docs/listing-requirements.md`](docs/listing-requirements.md). **Read at part two:** [`docs/experience-requirements.md`](docs/experience-requirements.md). **Look up as needed:** everything under [Reference](#reference).

| Minutes | What happens |
| --- | --- |
| 0 to 10 | Setup, open the queue, read the footer, read the listing doc, [run the spec](#commands-and-acceptance) |
| 10 to 20 | Severities and reasons in [`ASSUMPTIONS.md`](ASSUMPTIONS.md) |
| 20 to 35 | Two listing rules, tests first |
| 35 to 60 | The job, the store and the paginated queue |
| 60 to 70 | Decisions or the events route, if you get there |
| 70 to 80 | Part two: read the experience doc, write [`DESIGN.md`](DESIGN.md) |
| 80 to 90 | [The questions](#what-we-will-ask) |

## Getting started

Fork [https://github.com/fanvue/app-store-moderation-boilerplate](https://github.com/fanvue/app-store-moderation-boilerplate), add `simonstaton` as a contributor, and do all your work in a pull request.

```bash
git clone https://github.com/yourname/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

`npm run dev` starts a real Postgres on port 5544 and the web app on port 3000. Nothing to install beyond `npm i`, on Windows, macOS or Linux. Migrations in [`db/migrations/`](db/migrations) are applied when the server starts.

Open [http://localhost:3000](http://localhost:3000). You should see a queue of listings. Read the footer.

## The situation

The Fanvue App Store lets third-party developers list apps for creators. Every listing has to meet the Listing Requirements before it goes live, and today a moderator checks each one by hand. There are 2,015 listings in the queue.

The page you just opened fetches every listing, reviews every listing and renders every listing, on every request. The footer says what that costs. Part one is about making that not be true.

Apps can also publish **fan experiences** onto a creator's profile: a quiz, a stream, a game, a wheel. They go live the moment the API accepts them, fans pay inside them, and nobody checks them unless a fan complains. That is part two.

## Part one: listings

1. **Read [`docs/listing-requirements.md`](docs/listing-requirements.md).** Six rules are decidable from the listing data; the rest are for a person. The doc states three awkward cases openly:
   - ordinary English that looks like a competitor name
   - a developer's own suite sharing copy
   - a plan in a currency the range cannot be checked in

   Others it leaves to you, such as a withdrawn plan at a price nobody can buy.
2. **Pick severities before you write a second rule.** In [`ASSUMPTIONS.md`](ASSUMPTIONS.md), give all six rules a severity and a one-line reason, citing section [4.5](docs/listing-requirements.md#45-how-we-apply-this-bar) where it applies. We will probe two of them. Changing your mind later is fine; the first draft is what we want to see.
3. **Implement two more rules** in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Rule [2.3](docs/listing-requirements.md#23-listing-quality) is done as a worked example. More rules are a bonus; two real ones are enough to make the rest of part one mean something.
4. **Move the review out of the page. This is the core.** Build the job in [`review-job.ts`](src/lib/moderation/review-job.ts) and the store in [`store.ts`](src/lib/moderation/store.ts). Then make [`app/page.tsx`](app/page.tsx) read a page of stored reviews, with the filter in the URL. Meet [the bar for the queue](#the-bar-for-the-queue). Write down in [`ASSUMPTIONS.md`](ASSUMPTIONS.md) what triggers the job, what the schema is and why, and what the job re-reviews when one listing changes. [How this runs in production](#how-this-runs-in-production) has the constraints.
5. **If there is time, moderator decisions.** They are stubbed in [`decisions.ts`](src/lib/moderation/decisions.ts) and [`app/api/moderation/decisions/route.ts`](app/api/moderation/decisions/route.ts). Meet [the bar for decisions](#the-bar-for-decisions).

### The bar for the queue

Two thousand listings, one moderator, ten minutes. The queue is the product.

- **No API calls on page load.** A moderator's page load reads the store.
- **Worst first, across pages.** Page, size, severity and rule live in the URL, so "only the rejects, worst first" is a link one moderator can send another.
- **Three states look different:** passed every rule, not yet reached by the job, and already decided by a person. The queue says when the job last ran.
- **Which rule fired, and where, at a glance.** The matched text for a [1.6](docs/listing-requirements.md#16-no-promotion-of-other-platforms) or [E3](docs/experience-requirements.md#e3-no-off-platform-payment) finding is visible, so a false positive is dismissed in seconds.
- **One item per duplicate pair.** Two listings flagged as each other's duplicate under [4.2](docs/listing-requirements.md#42-originality) show up as one thing to look at.
- **Quick at two thousand rows,** without shipping two thousand full listings to the page.

### The bar for decisions

- **A decision is a row in Postgres,** so it survives `npm run dev` restarting and `npm run review` can see it.
- **It records which findings were on screen and which doc revision produced them,** so a revision 4 re-run does not silently reopen a revision 3 approval.
- **Two moderators share the queue.** A decision posted against a listing someone else decided since this moderator loaded it answers `409` with the decision that got there first. What the second moderator sees is your call; write it down.
- **The developer's note is not the moderator's message.** Think about what a [1.6](docs/listing-requirements.md#16-no-promotion-of-other-platforms) note gives away.

## Part two: experiences

1. **Read [`docs/experience-requirements.md`](docs/experience-requirements.md).** Six rules, same shape as the listing rules, with a different vocabulary for what a finding leads to. For the design you only need its first two sections; the rules are for coding one.
2. **Write [`DESIGN.md`](DESIGN.md). This is the deliverable.** It has the headings: where the review runs, what it may do with nobody watching, what happens to fans who paid, how reports and findings share a queue, and what the record shows afterwards.
3. **If there is time, code.** Make [`app/api/moderation/events/route.ts`](app/api/moderation/events/route.ts) accept the events `npm run replay-events` sends, and implement one rule in [`experiences/rules.ts`](src/lib/moderation/experiences/rules.ts). The sequence is in [`fixtures/experience-events.ts`](fixtures/experience-events.ts). Each experience is first published as it was on the day, with no reports, and later changes and reports arrive as their own events. These cases are there on purpose:
   - **Private Q&A** is published clean, then updated to add the line that breaks [E3](docs/experience-requirements.md#e3-no-off-platform-payment). The first review finds nothing; the second must.
   - **The second Tip Jar Royale** arrives four minutes after the first, same app and profile, new id. [E5](docs/experience-requirements.md#e5-no-duplicates-on-a-profile) cannot be decided from either event alone.
   - **Spin the Wheel and Trivia Tuesday** each get an update that changes nothing a rule looks at. It should not produce a second finding or notification.
   - **`evt-0009`**, the second Tip Jar Royale's publish, is delivered twice.
   - **Late Night Stream** crosses the [E6](docs/experience-requirements.md#e6-report-escalation) bar from reports that arrive five weeks after it went live. A review that only runs on publish never sees them.

## What we will ask

The last ten minutes are talking. These are the questions, so you can think about them in advance:

1. What triggers the review job in production, and what does it re-review when one listing changes?
2. Revision 4 drops a competitor from [1.6](docs/listing-requirements.md#16-no-promotion-of-other-platforms) and raises the [3.3](docs/listing-requirements.md#33-pricing-accuracy) ceiling. What re-runs, what does not, and what does a moderator see on a listing approved under revision 3?
3. Which severities may act with no person in the loop? For experiences, which rules may take something down on their own, and what does the fan who paid see?
4. What does the developer read when they are rejected under [1.6](docs/listing-requirements.md#16-no-promotion-of-other-platforms) or [4.2](docs/listing-requirements.md#42-originality), and what must that text not contain?
5. Which rule will have the worst precision in production, and how would you find out?
6. Three moderators share the queue. What breaks?

---

# Reference

Look things up here as you need them.

## Commands and acceptance

```bash
npm run test:spec     # the acceptance criteria. Red today
npm run test:watch    # your own tests, as you write them
npm run metrics       # findings per rule over the whole queue, against the generator's ground truth
npm run review        # the review job, once you have written it. Needs the database up
npm run replay-events # posts the experience events to your dev server, one of them twice
npm run db            # Postgres on its own, for running the job without the web server
npm run db:migrate    # apply a migration you added while the server was running
npm run db:reset      # delete the database. Stop npm run dev first
```

- **Two spec files are the acceptance criteria:** [`spec.test.ts`](src/lib/moderation/spec.test.ts) for listings and [`experiences/spec.test.ts`](src/lib/moderation/experiences/spec.test.ts) for experiences. Each lists hand-written fixtures and the rule sections each one must break.
- **The specs say which fixtures break which rule, nothing more.** Not how to detect it, how serious it is, or what a moderator should see. **Do not edit them.** If you think one is wrong, say so and we will talk about it.
- **`npm run metrics` catches a flooding rule.** It runs your rules over all 2,015 listings and prints how many fired per rule next to how many the fixture generator planted. A count far above expected is flooding; far below is missing things. The generator plants no duplicates, so [4.2](docs/listing-requirements.md#42-originality) has no expected count, and any 4.2 pair among generated listings is a false positive.

## How this runs in production

The fixtures are here so the repo works offline. The mock API behaves like the real one in every way that matters, and each of those ways is listed here.

- **Listing API.** `GET /apps` returns at most 50 summaries a page. The fields the rules need come from `GET /apps/{uuid}`, one call per listing. Fetching everything is 41 list calls and 2,015 detail calls.
- **Latency.** Every mock call takes about three milliseconds, standing in for a round trip, and every call is counted. The queue footer shows both.
- **Rate limit.** The live API allows 200 calls a minute. The mock does not enforce it, but at that rate fetching everything takes about ten minutes. Nothing that runs on a page load can do that, and nothing should.
- **No server-side ordering.** `GET /apps` is in submission order and cannot filter by severity or rule. Worst-first across pages has to come from an index you keep.
- **Edits.** Editing a listing or a pricing plan starts a new submission, and a webhook says so. Listings are reviewed again after every edit. Rule [4.2](docs/listing-requirements.md#42-originality) compares listings to each other, so one edit can change another listing's findings.
- **Experiences arrive as events:** published, updated and reported, at least once each, in order per experience. Every event carries the whole experience as it then is. A review that only runs on publish never sees a report. `getAllExperiences()` in the [mock API](src/lib/fanvue/api.ts) stands in for a one-off backfill of what is already live; it is not how new experiences arrive.
- **Storage is Postgres.** [`src/lib/db/client.ts`](src/lib/db/client.ts) is the pool, [`db/migrations/`](db/migrations) is the schema, and [`0001_review_runs.sql`](db/migrations/0001_review_runs.sql) is the worked example. `npm run review` and `npm run dev` are different processes, so anything the job writes for the page to read goes through the database, not memory.
- **The database is one backend.** It is [PGlite](https://pglite.dev) behind a Postgres socket, with its files under `data/pg`. Statements from every connection run one at a time, and an open transaction makes the others wait.
- **Doc revisions.** The requirements doc is on revision 3. Revision 4 changes a word list and a price ceiling next quarter. Decisions made under revision 3 stay made.

## Rules of the game

- **Every finding is an `Issue`** (see [`rules.ts`](src/lib/moderation/rules.ts)): a rule number, a severity, a message, and optionally the field at fault.
- **Rule numbers are section headings.** `2.3 Listing quality` is rule `2.3`. Experience rules are numbered `E3`.
- **Severity is your call.** Pick one per rule and be ready to say why, or argue for a different scheme.
  - `reject`: the listing cannot go live as it is.
  - `fix`: the developer can correct it without anyone's judgement.
  - `warn`: a human should look.

  Experience findings use the same three. What each leads to on something already live is part of [`DESIGN.md`](DESIGN.md).
- **Deterministic only.** No network, no LLM, no external API. The listing or experience data is all you get.
- **Images are placeholders.** Every image URL points at a placeholder host so the repo works offline. Image content is never a signal.
- **Use your AI tool as much as you like.** Read the diff before you keep it. [`AGENTS.md`](AGENTS.md) tells the tool how to behave here; you may change or delete it, and we will ask why.
- `@fanvue/ui` is installed if you want it.

## Where to work

| File | What to do there |
| --- | --- |
| [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts) | The listing rules. `reviewListings` is the entry point |
| [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts) | Your own tests, one or more per rule |
| [`src/lib/moderation/review-job.ts`](src/lib/moderation/review-job.ts) | The job: crawl, review, store. `npm run review` runs it |
| [`src/lib/moderation/store.ts`](src/lib/moderation/store.ts) | The index the queue reads. Interface given, tables yours |
| [`db/migrations/`](db/migrations) | Your schema, one `.sql` file per change. `0001` is the worked example |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts) | `worstSeverity` and `sortQueue`, stubbed for you |
| [`src/lib/moderation/decisions.ts`](src/lib/moderation/decisions.ts) | Moderator decisions, stubbed for you |
| [`src/lib/moderation/experiences/rules.ts`](src/lib/moderation/experiences/rules.ts), [`rules.test.ts`](src/lib/moderation/experiences/rules.test.ts) | The experience rules, if you get to code in part two |
| [`app/page.tsx`](app/page.tsx), [`app/listings/[uuid]/page.tsx`](app/listings/%5Buuid%5D/page.tsx) | The pages. Make them read the store |
| [`app/api/moderation/`](app/api/moderation) | The decisions and events routes, stubbed for you |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx) | The moderator's queue |
| [`src/components/FindingsList.tsx`](src/components/FindingsList.tsx), [`ListingDetail.tsx`](src/components/ListingDetail.tsx) | One listing, as a moderator inspects it |
| [`scripts/review.ts`](scripts/review.ts) | The command-line entry to the job, if it needs arguments |
| [`ASSUMPTIONS.md`](ASSUMPTIONS.md) | Anything you decided that the docs do not say |
| [`DESIGN.md`](DESIGN.md) | Part two |

Everything else is there to be read, not changed: the [fixtures](fixtures), the mock API under [`src/lib/fanvue/`](src/lib/fanvue) and [`app/api/v0/`](app/api/v0), the database plumbing under [`src/lib/db/`](src/lib/db), the [types](src/lib/fanvue/types.ts), and the two spec files.
