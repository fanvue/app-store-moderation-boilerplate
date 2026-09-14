# Fanvue product engineer session: App Store listing moderation

A pairing session. You build the screen a Fanvue moderator uses to check App Store listings against the [Listing Requirements](docs/listing-requirements.md), and the interviewer watches and asks questions as you go.

## Before the call

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and check you see a queue of listings. Doing this beforehand means we spend the session on the work rather than on npm.

## The task

The Fanvue App Store lets third-party developers list apps for creators. Every listing has to meet the Listing Requirements before it goes live, and today a moderator checks each one by hand. There are 2,011 listings in the queue.

Build the tool that does the checking, and the screen a moderator clears the queue with.

1. Read [`docs/listing-requirements.md`](docs/listing-requirements.md). Six rules are decidable from the listing data; the rest are for a person.
2. Implement them in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). Rule 2.3 is done as a worked example.
3. Make the queue something a moderator can actually work: [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx), with the stubs in [`queue.ts`](src/lib/moderation/queue.ts).

Where you start is up to you, and you will not finish all of it. We are more interested in what you choose to do and why than in how much you get through.

## What done looks like

[`src/lib/moderation/spec.test.ts`](src/lib/moderation/spec.test.ts) is the acceptance criteria: eleven hand-written listings and the rule sections each one must break.

```bash
npm run test:spec     # the acceptance criteria. Red today
npm run test:watch    # your own tests, as you write them
```

It says which listings are in trouble and under which rule. It says nothing about how to detect anything, how serious anything is, or what a moderator should see. **Do not edit it.** If you think it is wrong, say so and we will talk about it.

## Rules of the game

- **Every finding is an `Issue`** (see [`rules.ts`](src/lib/moderation/rules.ts)): a rule number, a severity, a message, and optionally the field at fault.
- **Rule numbers are section headings.** `2.3 Listing quality` is rule `2.3`, so a finding about it sets `rule: "2.3"`.
- **Severity is your call.** `reject`: the listing cannot go live as it is. `fix`: the developer can correct it without anyone's judgement. `warn`: a human should look. Pick one per rule and be ready to say why. Argue for a different scheme if you prefer one.
- **Deterministic only.** No network, no LLM, no external API. The listing data is all you get.
- **Images are placeholders.** Every image URL in the fixtures points at a placeholder host because this repo works offline. Image content is never a signal here.
- **The queue is the product.** Two thousand listings, one moderator, ten minutes. What do they see?
- **Use your AI tool as much as you like.** Read the diff before you keep it.
- `@fanvue/ui` is installed if you want it.

## Where to work

| File | What to do there |
| --- | --- |
| [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts) | The rules. `reviewListings` is the entry point |
| [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts) | Your own tests, one or more per rule |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts) | `worstSeverity` and `sortQueue`, stubbed for you |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx) | The moderator's queue |
| [`src/components/FindingsList.tsx`](src/components/FindingsList.tsx), [`ListingDetail.tsx`](src/components/ListingDetail.tsx) | One listing, as a moderator inspects it |
| [`ASSUMPTIONS.md`](ASSUMPTIONS.md) | Anything you decided that the docs do not say |

Everything else — the fixtures, the mock API, the types — is there to be read, not changed.

## How the session runs

Intros and your questions about Fanvue first, then the task, then a look at what you built. We will interrupt with questions while you work: why that rule first, why that severity, where this validation should run when it is 2,000 listings and not 11, what you would do about the rules a program cannot decide.

## Hand your code over

Make a private repo from this template with the green "Use this template" button, choose Private, and invite the GitHub user `simonstaton`. You can also email a git diff to simon.staton@fanvue.com.
