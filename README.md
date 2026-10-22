# Fanvue product engineer session: App Store moderation

A 90-minute pairing session. You build the tool a Fanvue moderator uses to check App Store listings against the [Listing Requirements](docs/listing-requirements.md), then design how it handles fan experiences, which go live before anyone looks at them. The interviewer watches and asks questions as you go.

## Getting Started

On [the repository](https://github.com/fanvue/app-store-moderation-boilerplate), choose **Use this template → Create a new repository** and make it private. Add `simonstaton` as a collaborator, and do all your work in a pull request in your copy. Please don't fork it: forks are public, and pull requests to this repository are closed automatically.

You need Node 24 (`nvm use` reads `.nvmrc`).

```bash
git clone https://github.com/yourname/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

`npm run dev` starts the web app and a Postgres database, so there is nothing else to install. Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings. It takes 10 to 20 seconds to load; the footer says why.

## The task

The Fanvue App Store lets third-party developers list apps for creators. Every listing has to meet the Listing Requirements before it goes live, and today a moderator checks each one by hand. There are 2,015 listings in the queue, and the page you just opened fetches and reviews every one of them on every request.

**Part one: listings**

1. Read [`docs/listing-requirements.md`](docs/listing-requirements.md). Six rules are decidable from the listing data; the rest are for a person.
2. Choose a severity for each of the six rules, with a reason, in [`ASSUMPTIONS.md`](ASSUMPTIONS.md). We will ask about two of them.
3. Implement rules in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Rule 2.3 is done as a worked example.
4. Move the review out of the page. Write the job in [`review-job.ts`](src/lib/moderation/review-job.ts), the store in [`store.ts`](src/lib/moderation/store.ts), and make [`app/page.tsx`](app/page.tsx) read one page of stored reviews. This is the core of part one. [How this runs in production](docs/production.md) has the constraints.
5. If you get there, moderator decisions, in [`decisions.ts`](src/lib/moderation/decisions.ts).

**Part two: experiences**

Apps can also publish fan experiences onto a creator's profile: a quiz, a stream, a game. They go live straight away, fans pay inside them, and nobody checks them unless a fan complains.

1. Read [`docs/experience-requirements.md`](docs/experience-requirements.md). Six more rules, and a choice about what a finding does to something already live.
2. Write the design in [`DESIGN.md`](DESIGN.md). This is the deliverable for part two.
3. If you get there, make [the events route](app/api/moderation/events/route.ts) accept what `npm run replay-events` sends ([the cases it contains](docs/production.md#experiences)), and implement one rule in [`experiences/rules.ts`](src/lib/moderation/experiences/rules.ts).

Where you start is up to you, and you will not finish all of it. We are more interested in what you choose to do and why than in how much you get through.

## What done looks like

[`spec.test.ts`](src/lib/moderation/spec.test.ts) and [`experiences/spec.test.ts`](src/lib/moderation/experiences/spec.test.ts) are the acceptance criteria: fifteen hand-written listings, eleven hand-written experiences, and the rule sections each one must break.

```bash
npm run test:spec     # both specs. Red today
npm run test:spec:listings     # just the listing spec
npm run test:spec:experiences  # just the experience spec
npm run test:watch    # your own tests, as you write them
npm run metrics       # how many findings each rule makes over the whole queue
npm run review        # the review job, once you have written it
npm run replay-events # posts the experience events to your dev server
npm run db:query -- "select * from review_runs"   # look inside the database
```

The specs say which listings are in trouble and under which rule. They say nothing about how to detect anything, how serious anything is, or what a moderator should see. **Do not edit them.** If you think one is wrong, say so and we will talk about it.

`npm run metrics` puts each rule's count next to how many the fixture generator planted, so you see a rule flooding the queue before a moderator does. The generator plants no duplicates, so any [4.2](docs/listing-requirements.md#42-originality) pair among generated listings is a false positive.

**The queue is the product.** Two thousand listings, one moderator, ten minutes. It is done when:

- A page load reads the store and makes no API calls.
- It is worst first across pages, and page, size, severity and rule are in the URL, so "only the rejects, worst first" is a link one moderator can send another.
- A listing that passed every rule looks different from one the job has not reached and from one a person already decided. The queue says when the job last ran.
- The rule that fired and the text it matched are visible, so a false positive takes seconds to dismiss.
- Two listings flagged as each other's 4.2 duplicate show up as one thing to look at.
- Two thousand rows still feel quick, without sending two thousand full listings to the browser.

**Decisions**, if you get there, are done when:

- A decision is a row in Postgres. It records which findings were on screen and which revision of the doc produced them, so a revision 4 re-run does not silently reopen a revision 3 approval.
- A decision on a listing someone else decided since you loaded it gets a `409` with the decision that got there first. What the second moderator sees is your call.
- The note the developer reads is not the message the moderator reads. Think about what a 1.6 note gives away.

## Rules of the game

- **Every finding is an `Issue`** (see [`rules.ts`](src/lib/moderation/rules.ts)): a rule number, a severity, a code, a message, and optionally the field at fault. Add fields if a finding needs to carry more, such as the matched text.
- **Rule numbers are section headings.** `2.3 Listing quality` is rule `2.3`, so a finding about it sets `rule: "2.3"`. Experience rules are numbered `E3`.
- **Severity is your call.** `reject`: the listing cannot go live as it is. `fix`: the developer can correct it without anyone's judgement. `warn`: a human should look. Pick one per rule and be ready to say why. Argue for a different scheme if you prefer one.
- **Write down what the docs do not say** in [`ASSUMPTIONS.md`](ASSUMPTIONS.md), including what triggers the review job, your schema and why, and what the job re-reviews when one listing changes.
- **Deterministic only.** No network, no LLM, no external API. The listing or experience data is all you get.
- **Images are placeholders.** Every image URL in the fixtures points at a placeholder host because this repo works offline. Image content is never a signal here.
- **Use your AI tool as much as you like.** Read the diff before you keep it. [`AGENTS.md`](AGENTS.md) tells it how to behave here; you may change or delete it, and we will ask why.
- `@fanvue/ui` is installed if you want it.

## What we will ask

The session ends with a conversation. These are the questions, so you can think about them in advance:

1. What triggers the review job in production, and what does it re-review when one listing changes?
2. Revision 4 drops a competitor from 1.6 and raises the 3.3 ceiling. What re-runs, what does not, and what does a moderator see on a listing approved under revision 3?
3. Which severities may act with no person in the loop? For experiences, which rules may take something down on their own, and what does the fan who paid see?
4. What does the developer read when they are rejected under 1.6 or 4.2, and what must that text not contain?
5. Which rule will have the worst precision in production, and how would you find out?
6. Three moderators share the queue. What breaks?

## Where to work

| File                                                                                                                          | What it is                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts)                                                                  | The listing rules. `reviewListings` is called by the pages, the spec and `npm run metrics`          |
| [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts)                                                        | Unit tests for the listing rules, run by `npm run test:watch`                                       |
| [`src/lib/moderation/review-job.ts`](src/lib/moderation/review-job.ts)                                                        | The review job, run by `npm run review`. Also holds `fetchEveryListing`, which the pages call today |
| [`src/lib/moderation/store.ts`](src/lib/moderation/store.ts)                                                                  | The review store the job writes and the pages read. Interface only                                  |
| [`db/migrations/`](db/migrations)                                                                                             | The database schema, applied when `npm run dev` starts and by `npm run db:migrate`                  |
| [`src/lib/moderation/decisions.ts`](src/lib/moderation/decisions.ts)                                                          | Moderator decisions, called by the decisions route                                                  |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts)                                                                  | Severity helpers. `SEVERITY_ORDER` is used by `npm run metrics`                                     |
| [`app/page.tsx`](app/page.tsx), [`app/listings/[uuid]/page.tsx`](app/listings/%5Buuid%5D/page.tsx)                            | The queue at `/` and one listing at `/listings/<uuid>`                                              |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx)                                                            | The queue table, rendered by `app/page.tsx`                                                         |
| [`src/components/ListingDetail.tsx`](src/components/ListingDetail.tsx), [`FindingsList.tsx`](src/components/FindingsList.tsx) | One listing and its findings, rendered by the listing page                                          |
| [`app/api/moderation/`](app/api/moderation)                                                                                   | The decisions route and the events route that `npm run replay-events` posts to                      |
| [`src/lib/moderation/experiences/rules.ts`](src/lib/moderation/experiences/rules.ts)                                          | The experience rules. `reviewExperiences` is called by the experience spec                          |
| [`ASSUMPTIONS.md`](ASSUMPTIONS.md)                                                                                            | Your notes on what the docs leave open                                                              |
| [`DESIGN.md`](DESIGN.md)                                                                                                      | The part two design, with its headings                                                              |

Everything else — the fixtures, the mock API, the database plumbing, the types, the two spec files — is there to be read, not changed.
