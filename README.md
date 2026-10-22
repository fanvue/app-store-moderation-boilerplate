# Fanvue product engineer session: App Store moderation

A 90-minute pairing session. You build a tool that a Fanvue moderator uses to check App Store listings against the [Listing Requirements](docs/listing-requirements.md). Then you design how the tool handles fan experiences, which go live before anyone checks them. The interviewer watches and asks questions as you go.

## Getting Started

On [the repository](https://github.com/fanvue/app-store-moderation-boilerplate), choose **Use this template → Create a new repository** and make it private. Add `simonstaton` as a collaborator. Do all your work in a pull request in your copy. Do not fork it. Forks are public, and pull requests to this repository are closed automatically.

You need Node 24 (`nvm use` reads `.nvmrc`).

```bash
git clone https://github.com/yourname/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

`npm run dev` starts the web app and a Postgres database, so there is nothing else to install. Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings. It takes 10 to 20 seconds to load. The footer explains why.

## The task

**Apps** are web applications that creators install on Fanvue and give consent to. Developers list them in the Fanvue App Store.

**Experiences** are embedded pages that an app publishes to a creator's profile on Fanvue, such as a game or a live stream. Fans can pay inside them.

**Moderators** check both against Fanvue's requirements. Every app listing must meet the Listing Requirements before it goes live. Today a moderator checks each listing by hand. Experiences go live as soon as an app publishes them. Nobody checks them unless a fan complains.

There are 2,015 listings in the queue. The page you just opened fetches and reviews all of them every time it loads.

**Part one: listings**

1. Read [`docs/listing-requirements.md`](docs/listing-requirements.md). Six rules can be checked from the listing data alone. A person decides the rest.
2. Implement rules in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Rule 2.3 is already done as a worked example.
3. Move the review out of the page. Write the review job in [`review-job.ts`](src/lib/moderation/review-job.ts) and the store in [`store.ts`](src/lib/moderation/store.ts). Then make [`app/page.tsx`](app/page.tsx) read one page of stored reviews. This is the core of part one. The constraints are in [How this runs in production](docs/production.md).
4. Optional: add moderator decisions in [`decisions.ts`](src/lib/moderation/decisions.ts).

**Part two: experiences**

1. Read [`docs/experience-requirements.md`](docs/experience-requirements.md). It has six more rules. It also asks what a finding does to a live experience.
2. Think through the [design questions](docs/experience-requirements.md#design-questions) at the end of that doc. We will discuss them together.
3. Optional: make [the events route](app/api/moderation/events/route.ts) accept the events that `npm run replay-events` sends ([the cases it contains](docs/production.md#experiences)). Optional: implement one rule in [`experiences/rules.ts`](src/lib/moderation/experiences/rules.ts).

You choose where to start. You will not finish everything. We care more about what you choose to do, and why, than how much you finish.

## What done looks like

The acceptance criteria are two spec files, [`spec.test.ts`](src/lib/moderation/spec.test.ts) and [`experiences/spec.test.ts`](src/lib/moderation/experiences/spec.test.ts). They list 15 hand-written listings and 11 hand-written experiences, and the rules that each one must break.

```bash
npm run test:spec     # both specs. They fail today
npm run test:spec:listings     # just the listing spec
npm run test:spec:experiences  # just the experience spec
npm run test:watch    # your own tests, as you write them
npm run metrics       # how many findings each rule makes over the whole queue
npm run review        # the review job, once you have written it
npm run replay-events # posts the experience events to your dev server
npm run db:query -- "select * from review_runs"   # look inside the database
```

The specs say what must be flagged, and under which rule. They do not say how to detect it, how serious it is, or what a moderator should see. **Do not edit them.** If you think one is wrong, say so and we will talk about it.

`npm run metrics` shows how many listings each rule flags, and how many the test data was built to break. If a rule flags far more, it is flagging listings it should not. The generated listings have no real duplicates, so every [4.2](docs/listing-requirements.md#42-originality) match among them is a false positive.

**The queue is the product.** Two thousand listings, one moderator, ten minutes. The queue is done when:

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

## Rules of the game

- **Every finding is an `Issue`** (see [`rules.ts`](src/lib/moderation/rules.ts)): a rule number, a severity, a code, a message, and optionally the field at fault.
- **Rule numbers are section headings.** `2.3 Listing quality` is rule `2.3`, so a finding about it sets `rule: "2.3"`. Experience rules are numbered like `E3`.
- **Severity is your call.** `reject`: the listing cannot go live as it is. `fix`: the developer can correct it without anyone's judgement. `warn`: a person should look. Pick one per rule and be ready to say why.
- **Deterministic only.** No network, no LLM and no external API. The rules may use only the listing or experience data.
- **Images are placeholders.** Every image URL in the fixtures points at a placeholder host, so the repo works offline. Image content is never a signal here.
- **Use your AI tool as much as you like.** Read the diff before you keep it. [`AGENTS.md`](AGENTS.md) tells the tool how to behave in this repo. You may change or delete it, and we will ask why.
- `@fanvue/ui` is installed if you want it.

## What we will ask

The session ends with a conversation about these questions. You can think about them in advance.

1. What triggers the review job in production, and what does it re-review when one listing changes?
2. Revision 4 drops a competitor from 1.6 and raises the 3.3 price ceiling. What re-runs, what does not, and what does a moderator see on a listing approved under revision 3?
3. Which severities may act without a person checking first? For experiences, which rules may take an experience down on their own, and what does a fan who paid see?
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

Everything else (the fixtures, the mock API, the database plumbing, the types, the two spec files) is there to be read, not changed.
