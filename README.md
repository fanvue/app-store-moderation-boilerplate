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

Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings.

## The task

The Fanvue App Store lets third-party developers list apps for creators. Every listing has to meet the Listing Requirements before it goes live, and today a moderator checks each one by hand. There are 2,015 listings in the queue.

Apps can also publish **fan experiences** onto a creator's profile: a quiz, a stream, a game, a wheel. Those go live the moment the API accepts them, fans pay inside them, and nobody checks them unless a fan complains.

The session is in two parts. You will not finish all of either, and that is expected. We are more interested in what you choose to do and why than in how much you get through.

### Part one: listings

1. Read [`docs/listing-requirements.md`](docs/listing-requirements.md). Six rules are decidable from the listing data; the rest are for a person. The doc states three awkward cases openly: ordinary English that looks like a competitor name, a developer's own suite sharing copy, and a plan in a currency the range cannot be checked in. Others it leaves to you, such as a withdrawn plan at a price nobody can buy.
2. **Before you write a second rule**, put a severity and a one-line reason for all six in [`ASSUMPTIONS.md`](ASSUMPTIONS.md), citing section 4.5 where it applies. We will probe two of them. Changing your mind later is fine; the first draft is what we want to see.
3. Implement the rules in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Rule 2.3 is done as a worked example.
4. Make the queue something a moderator can actually work: [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx), with the stubs in [`queue.ts`](src/lib/moderation/queue.ts). The bar for the queue is below.
5. If there is time: moderator decisions, stubbed in [`decisions.ts`](src/lib/moderation/decisions.ts). The bar for those is below too.

### Part two: experiences

1. Read [`docs/experience-requirements.md`](docs/experience-requirements.md). Six rules again, same shape as the listing rules, and a different vocabulary for what a finding leads to.
2. Write the design in [`DESIGN.md`](DESIGN.md). It has the headings. Where the review runs, what it may do with nobody watching, what happens to fans who paid, how reports and findings share a queue, and what the record shows afterwards.
3. If there is time, implement one rule in [`src/lib/moderation/experiences/rules.ts`](src/lib/moderation/experiences/rules.ts) and decide how experiences reach the queue.

The design is the deliverable for part two. A rule with no design is worth less than a design with no rule.

## What done looks like

Two spec files are the acceptance criteria: [`spec.test.ts`](src/lib/moderation/spec.test.ts) for listings and [`experiences/spec.test.ts`](src/lib/moderation/experiences/spec.test.ts) for experiences. Each is a list of hand-written fixtures and the rule sections each one must break.

```bash
npm run test:spec     # the acceptance criteria. Red today
npm run test:watch    # your own tests, as you write them
npm run metrics       # findings per rule over the whole queue, against the generator's ground truth
```

The specs say which fixtures are in trouble and under which rule. They say nothing about how to detect anything, how serious anything is, or what a moderator should see. **Do not edit them.** If you think one is wrong, say so and we will talk about it.

`npm run metrics` runs your rules over all 2,015 listings and prints how many fired per rule next to how many the fixture generator planted. It is there so you can see a rule flooding the queue before a moderator does.

## How this runs in production

The fixtures and the mock API are here so the repo works offline. The real thing is different, and your design should assume the real thing:

- `GET /apps` returns at most 50 summaries a page. The fields the rules need come from `GET /apps/{uuid}`, one call per listing. Both are rate-limited. There is no sandbox.
- Editing a listing or a pricing plan starts a new submission, and a webhook says so. Listings are reviewed again after every edit.
- Experiences have no list endpoint across creators. A review tool reads an internal feed, and every publish or update arrives as an event.
- The requirements doc is on revision 3, and revision 4 changes a word list and a price ceiling next quarter. Decisions made under revision 3 stay made.

Say in `ASSUMPTIONS.md` where `reviewListings` runs, what it reads, and what it writes.

## The bar for the queue

Two thousand listings, one moderator, ten minutes. The queue is the product.

- Worst first. A listing that passed every rule looks different from one nothing has checked and from one a person already decided.
- The filter and sort live in the URL. "Show me only the rejects, worst first" is a link a moderator can send to another moderator.
- A moderator can tell at a glance which rule fired and where. The matched text for a 1.6 or E3 finding is visible, so a false positive is dismissed in seconds.
- Two listings flagged as each other's duplicate under 4.2 show up as one thing to look at, not two.
- Two thousand rows still feels quick.

## The bar for decisions

If you reach [`decisions.ts`](src/lib/moderation/decisions.ts):

- A decision survives `npm run dev` restarting.
- It records which findings were on screen and which revision of the doc produced them, so a revision 4 re-run does not silently reopen a revision 3 approval.
- Two moderators share the queue. Two decisions on the same listing at the same time do not silently overwrite each other. What the second moderator sees is your call; write it down.
- The note the developer reads is not the message the moderator reads. Think about what a 1.6 note gives away.

## What we will ask

The last part of the session is talking. These are the questions, so you can think about them in advance:

1. Where does the review run against the real API, and what does the queue read?
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
| 0 to 10 | Setup, read the listing doc, run the spec |
| 10 to 20 | Severities and reasons in `ASSUMPTIONS.md` |
| 20 to 45 | Listing rules, tests first |
| 45 to 60 | The queue, and decisions if you get there |
| 60 to 75 | Part two: read the experience doc, write `DESIGN.md` |
| 75 to 90 | The questions above |

## Where to work

| File | What to do there |
| --- | --- |
| [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts) | The listing rules. `reviewListings` is the entry point |
| [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts) | Your own tests, one or more per rule |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts) | `worstSeverity` and `sortQueue`, stubbed for you |
| [`src/lib/moderation/decisions.ts`](src/lib/moderation/decisions.ts) | Moderator decisions, stubbed for you |
| [`src/lib/moderation/experiences/rules.ts`](src/lib/moderation/experiences/rules.ts), [`rules.test.ts`](src/lib/moderation/experiences/rules.test.ts) | The experience rules, if you get to code in part two |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx) | The moderator's queue |
| [`src/components/FindingsList.tsx`](src/components/FindingsList.tsx), [`ListingDetail.tsx`](src/components/ListingDetail.tsx) | One listing, as a moderator inspects it |
| [`app/`](app) | Pages and routes, if decisions or experiences need them |
| [`ASSUMPTIONS.md`](ASSUMPTIONS.md) | Anything you decided that the docs do not say |
| [`DESIGN.md`](DESIGN.md) | Part two |

Everything else — the fixtures, the mock API, the types, the two spec files — is there to be read, not changed.
