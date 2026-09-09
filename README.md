# Fanvue product engineer session: App Store listing moderation

A one-hour pairing session. You build the screen a Fanvue moderator uses to check App Store listings against the [public Listing Requirements](docs/listing-requirements.md#common-rejection-reasons), and the interviewer watches and asks questions as you go.

## Quick start

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
npm i
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## The task

The Fanvue App Store lets third-party developers list apps for creators. Every listing must meet the public Listing Requirements before it goes live. Today a moderator checks each by hand. The task is to build a tool that automates parts of that job.

Start in `validateListing` in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts). This function takes one listing and returns its findings: the rule it breaks, how serious it is, and on which field.

1. Open the [Common rejection reasons](docs/listing-requirements.md#common-rejection-reasons) and decide which rules a program could validate deterministically. Data is available in [`fixtures/listings.ts`](fixtures/listings.ts).
2. Implement it in [`rules.ts`](src/lib/moderation/rules.ts) with tests.
3. Check it works in the UI.
4. Check the acceptance tests are passing.

After implementing validation, if you have time, sort the listings in severity order: fill in [`queue.ts`](src/lib/moderation/queue.ts) and hook it up to [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx).

## Rules of the game

- Every finding is an `Issue` (see [`rules.ts`](src/lib/moderation/rules.ts)): the rule it breaks, a severity, and a message.
- **Rule numbers are section headings.** `2.3 Listing quality` is rule `2.3`, so a finding about it sets `rule: "2.3"`.
- **Severity says who acts next.** `reject`: the listing cannot go live as it is. `fix`: the developer can correct it without anyone's judgement. `warn`: a human should look. Pick one per rule and be ready to say why. Argue for a different scheme if you prefer one.
- Only rules a program can decide from the listing data alone. Out of scope: anything that needs a human eye, and anything that needs a network request, LLM, or external API.
- The queue is the product. Can a moderator see every app's status at a glance and clear it quickly?
- Use your AI tool as much as you like. Ensure you check the diff after.
- If time remains: filter by status, or anything else a moderator needs. `@fanvue/ui` is installed.
- **Never edit the three `*.acceptance.test.*` files.** They are red today and they define done.

## Where to work

Five files to edit:

| File | What to do there |
| --- | --- |
| [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts) | Implement `validateListing`. It returns `Issue[]` |
| [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts) | Your own tests, one per rule |
| [`src/lib/moderation/queue.ts`](src/lib/moderation/queue.ts) | `worstSeverity` and `sortQueue`, stubbed for you |
| [`src/components/ReviewQueue.tsx`](src/components/ReviewQueue.tsx) | The moderator's queue. Its acceptance test says what it must show |
| [`ASSUMPTIONS.md`](ASSUMPTIONS.md) | Anything you decided that the docs do not say |

## The hour

| Time | What happens |
| --- | --- |
| 10 min | Intro, get the repo running, quick tour |
| 10 min | Decide the rules you will validate |
| 30 min | You build the validation |
| 5 min | Demo |
| 5 min | Questions for us |

## What we look for

- You separate the rules a program can check from the ones that need a human.
- You check what the AI tells you against the doc rather than taking its word for it.
- The acceptance tests pass without being edited, and each of your own tests pass.
- The queue order and the severities make sense to the moderator who has to act on them.

## Hand your code over

Make a private repo from this template with the green "Use this template" button, choose Private, and invite the GitHub user `simonstaton`. You can also email a git diff to simon.staton@fanvue.com.
