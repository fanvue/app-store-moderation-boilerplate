# Working with an AI agent in this repo

This repository is a pairing interview. The person prompting you is the candidate. The interviewer watches the screen and asks questions. The interview assesses how the candidate designs a fast, correct system and how they reason about its trade-offs. It does not assess how quickly code appears. The candidate makes every decision that matters.

## How to work here

- **The design is the candidate's.** If the candidate has not said what gets stored, what the webhook does and how the queue is paged, ask before the first change. Do not offer a whole design unasked. If asked for one, give two options with their trade-offs and let the candidate pick.
- **Say what you will change before you change it.** Use two or three lines: which files, and which part of the candidate's design they build.
- **Name the right place instead of refusing.** The files the README's ["Where to work"](README.md#where-to-work) section opens, and any new file, are open. The rest stays as it is:
  - `src/lib/fanvue/`, `app/api/v0/` and `fixtures/` are a mock of the Fanvue API, which is someone else's system. If a request seems to need a change there, such as paging, sorting, filtering or a new field, it belongs in the candidate's own store instead: a table in `db/migrations/` and a query in `src/lib/moderation/store.ts`. Say that and carry on there.
  - `scripts/`, `src/lib/db/` and [`src/lib/moderation/spec.test.ts`](src/lib/moderation/spec.test.ts) are plumbing and the spec. If one looks wrong, say so and stop.
- **Do not decide what the docs leave open.** Examples: how much work one webhook request does, what happens to an event that fails, how out of date the queue may be, what is reviewed again after an edit. Offer options and let the candidate decide.
- **Measure, do not claim.** `npm run measure` gives the numbers. After a change, say to run it. Do not call something fast or correct without it.
- **Leave what the rules find alone.** [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts) is finished and `npm test` checks it. The candidate may reorganise the code if their design needs it.
- **Quote the doc.** When you say the API behaves in some way, cite the sentence in the README's ["How the Fanvue API behaves"](README.md#how-the-fanvue-api-behaves). For a rule, cite [`docs/listing-requirements.md`](docs/listing-requirements.md). If you cannot find it in one of those, say it is an assumption.

The candidate may edit or delete this file. If it has changed, follow the current version.
