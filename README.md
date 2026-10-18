# Fanvue product engineer session: App Store moderation

A pairing session. You build the tool a Fanvue moderator uses to check App Store listings against the [Listing Requirements](docs/listing-requirements.md), then design how the same tool handles fan experiences, which go live before anyone looks at them. The interviewer watches and asks questions as you go.

## Getting Started

Fork [https://github.com/fanvue/app-store-moderation-boilerplate](https://github.com/fanvue/app-store-moderation-boilerplate) and add `simonstaton` as a contributor, do all your working in a pull-request.

```bash
git clone https://github.com/yourname/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

`npm run dev` starts two things: a real Postgres on port 5544, served by [PGlite](https://pglite.dev) with its files under `data/pg`, and the web app on port 3000. Nothing to install beyond `npm i`; it works the same on Windows, macOS and Linux. PGlite is one Postgres backend behind the socket: statements from every connection run one at a time, and an open transaction makes the others wait. Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings, then read the footer.

Migrations in [`db/migrations/`](db/migrations) are applied when the server starts. `npm run db:reset` deletes the database so the next start is from nothing; stop `npm run dev` first.

## The task

The Fanvue App Store lets third-party developers list apps for creators. Every listing has to meet the Listing Requirements before it goes live, and today a moderator checks each one by hand. There are 2,015 listings in the queue.

Apps can also publish **fan experiences** onto a creator's profile: a quiz, a stream, a game, a wheel. Those go live the moment the API accepts them, fans pay inside them, and nobody checks them unless a fan complains.

The session is in two parts. You will not finish all of either, and that is expected. We are more interested in what you choose to do and why than in how much you get through.

Open the queue and look at the footer first. The page you are looking at fetches every listing, reviews every listing and renders every listing, on every request. It says what that cost. Part one is about making that not be true.

### Part one: listings

1. Read [`docs/listing-requirements.md`](docs/listing-requirements.md). Six rules are decidable from the listing data; the rest are for a person. The doc states three awkward cases openly: ordinary English that looks like a competitor name, a developer's own suite sharing copy, and a plan in a currency the range cannot be checked in. Others it leaves to you, such as a withdrawn plan at a price nobody can buy.
2. **Before you write a second rule**, put a severity and a one-line reason for all six in [`ASSUMPTIONS.md`](ASSUMPTIONS.md), citing section 4.5 where it applies. We will probe two of them. Changing your mind later is fine; the first draft is what we want to see.
3. Implement two more rules in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Rule 2.3 is done as a worked example. More rules are a bonus, not the point; two real ones are enough to make the rest of part one mean something.
4. **Move the review out of the page.** The queue is reviewed on every request today. Build the job in [`review-job.ts`](src/lib/moderation/review-job.ts) and the store in [`store.ts`](src/lib/moderation/store.ts), then make [`app/page.tsx`](app/page.tsx) read a page of stored reviews with the filter in the URL. The bar for the queue is below. This is the core of part one.
5. If there is time: moderator decisions, stubbed in [`decisions.ts`](src/lib/moderation/decisions.ts) and [`app/api/moderation/decisions/route.ts`](app/api/moderation/decisions/route.ts). The bar for those is below too.

### Part two: experiences

1. Read [`docs/experience-requirements.md`](docs/experience-requirements.md). Six rules again, same shape as the listing rules, and a different vocabulary for what a finding leads to.
2. Write the design in [`DESIGN.md`](DESIGN.md). It has the headings. Where the review runs, what it may do with nobody watching, what happens to fans who paid, how reports and findings share a queue, and what the record shows afterwards.
3. If there is time, make [`app/api/moderation/events/route.ts`](app/api/moderation/events/route.ts) accept the event sequence that `npm run replay-events` sends, and implement one rule in [`src/lib/moderation/experiences/rules.ts`](src/lib/moderation/experiences/rules.ts). The sequence is described at the top of [`fixtures/experience-events.ts`](fixtures/experience-events.ts): one event is delivered twice, one experience is published clean and then updated into a violation, two updates change nothing, and the reports that put an experience over the E6 bar arrive weeks after it was published.

The design is the deliverable for part two. A rule with no design is worth less than a design with no rule.

## What done looks like

Two spec files are the acceptance criteria: [`spec.test.ts`](src/lib/moderation/spec.test.ts) for listings and [`experiences/spec.test.ts`](src/lib/moderation/experiences/spec.test.ts) for experiences. Each is a list of hand-written fixtures and the rule sections each one must break.

```bash
npm run test:spec     # the acceptance criteria. Red today
npm run test:watch    # your own tests, as you write them
npm run metrics       # findings per rule over the whole queue, against the generator's ground truth
npm run review        # the review job, once you have written it. Needs the database up
npm run replay-events # posts the experience events to your dev server, one of them twice
npm run db            # Postgres on its own, for running the job without the web server
npm run db:migrate    # apply a migration you added while the server was running
npm run db:reset      # delete the database
```

The specs say which fixtures are in trouble and under which rule. They say nothing about how to detect anything, how serious anything is, or what a moderator should see. **Do not edit them.** If you think one is wrong, say so and we will talk about it.

`npm run metrics` runs your rules over all 2,015 listings and prints how many fired per rule next to how many the fixture generator planted. It is there so you can see a rule flooding the queue before a moderator does.

## How this runs in production

The fixtures are here so the repo works offline. The mock API behaves like the real one in the ways that matter, and the README states every one of them:

- `GET /apps` returns at most 50 summaries a page. The fields the rules need come from `GET /apps/{uuid}`, one call per listing. Fetching everything is 41 list calls and 2,015 detail calls.
- Every mock call takes about three milliseconds, as a stand-in for a round trip, and every call is counted. The queue footer shows both.
- The live API allows 200 calls a minute. The mock does not enforce that, but at that rate fetching everything takes about ten minutes. Nothing that runs on a page load can do it, and nothing that runs on a page load should.
- `GET /apps` is in submission order and cannot filter by severity or rule. Worst-first across pages has to come from an index you keep.
- Editing a listing or a pricing plan starts a new submission, and a webhook says so. Listings are reviewed again after every edit. Rule 4.2 compares listings to each other, so one edit can change another listing's findings.
- Experiences arrive as events: published, updated and reported, at least once each, in order per experience. Every event carries the whole experience as it then is. A review that only runs on publish never sees a report. `getAllExperiences()` in the mock API stands in for a one-off backfill of what is already live; it is not how new experiences arrive.
- Your storage is Postgres. `src/lib/db/client.ts` is the pool, `db/migrations/` is the schema, and `0001_review_runs.sql` is the worked example. `npm run review` and `npm run dev` are different processes, so anything the job writes that the page should read goes through the database, not memory.
- The requirements doc is on revision 3, and revision 4 changes a word list and a price ceiling next quarter. Decisions made under revision 3 stay made.

Say in `ASSUMPTIONS.md` what triggers the job, what the schema is and why, and what the job re-reviews when one listing changes.

## The bar for the queue

Two thousand listings, one moderator, ten minutes. The queue is the product.

- A moderator's page load makes no API calls. It reads the store.
- Worst first, across pages. Page, size, severity and rule live in the URL, so "only the rejects, worst first" is a link a moderator can send to another moderator.
- A listing that passed every rule looks different from one the job has not reached and from one a person already decided. The queue says when the job last ran.
- A moderator can tell at a glance which rule fired and where. The matched text for a 1.6 or E3 finding is visible, so a false positive is dismissed in seconds.
- Two listings flagged as each other's duplicate under 4.2 show up as one thing to look at, not two.
- Two thousand rows still feels quick, and the page does not ship two thousand full listings to do it.

## The bar for decisions

If you reach [`decisions.ts`](src/lib/moderation/decisions.ts):

- A decision is a row in Postgres, so it survives `npm run dev` restarting and `npm run review` can see it.
- It records which findings were on screen and which revision of the doc produced them, so a revision 4 re-run does not silently reopen a revision 3 approval.
- Two moderators share the queue. A decision posted against a listing someone else decided since this moderator loaded it answers `409` with the decision that got there first. What the second moderator sees is your call; write it down.
- The note the developer reads is not the message the moderator reads. Think about what a 1.6 note gives away.

## What we will ask

The last part of the session is talking. These are the questions, so you can think about them in advance:

1. What triggers the review job in production, and what does it re-review when one listing changes?
2. Revision 4 drops a competitor from 1.6 and raises the 3.3 ceiling. What re-runs, what does not, and what does a moderator see on a listing approved under revision 3?
3. Which severities may act with no person in the loop? For experiences, which rules may take something down on their own, and what does the fan who paid see?
4. What does the developer read when they are rejected under 1.6 or 4.2, and what must that text not contain?
5. Which rule will have the worst precision in production, and how would you find out?
6. Three moderators share the queue. What breaks?

## Rules of the game

- **Every finding is an `Issue`** (see [`rules.ts`](src/lib/moderation/rules.ts)): a rule number, a severity, a message, and optionally the field at fault. Listing rules are numbered `2.3`; experience rules are numbered `E3`.
- **Rule numbers are section headings.** `2.3 Listing quality` is rule `2.3`, so a finding about it sets `rule: "2.3"`.
- **Severity is your call.** `reject`: the listing cannot go live as it is. `fix`: the developer can correct it without anyone's judgement. `warn`: a human should look. Pick one per rule and be ready to say why. Argue for a different scheme if you prefer one. Experience findings use the same three, and what each one leads to on something already live is part of `DESIGN.md`.
- **Deterministic only.** No network, no LLM, no external API. The listing or experience data is all you get.
- **Images are placeholders.** Every image URL in the fixtures points at a placeholder host because this repo works offline. Image content is never a signal here.
- **Use your AI tool as much as you like.** Read the diff before you keep it. [`AGENTS.md`](AGENTS.md) tells the tool how to behave in this repo; you may change or delete it, and we will ask why.
- `@fanvue/ui` is installed if you want it.

## How the 90 minutes go

| Minutes | What happens |
| --- | --- |
| 0 to 10 | Setup, open the queue, read the footer, read the listing doc, run the spec |
| 10 to 20 | Severities and reasons in `ASSUMPTIONS.md` |
| 20 to 35 | Two listing rules, tests first |
| 35 to 60 | The job, the store and the paginated queue |
| 60 to 70 | Decisions or the events route, if you get there |
| 70 to 80 | Part two: read the experience doc, write `DESIGN.md` |
| 80 to 90 | The questions above |

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

Everything else — the fixtures, the mock API under `src/lib/fanvue/` and `app/api/v0/`, the database plumbing under `src/lib/db/`, the types, the two spec files — is there to be read, not changed.
