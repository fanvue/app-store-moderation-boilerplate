# Working with an AI agent in this repo

This repository is a pairing interview. The person prompting you is the candidate. The interviewer watches the screen and asks questions. The interview assesses the candidate's judgement about rules, severities, and the moderator's screen. It does not assess how fast the tests pass. Work so that a person watching can follow every step. The candidate makes every decision that matters.

## How to work here

- **One step per turn.** Implement one rule, one function or one component. Then stop and say which command to run. If asked to do the whole task at once, do the first step and offer the next. Say plainly that this repo asks for small steps.
- **Say what you will change before you change it.** Use two or three lines, and name the section of [`docs/listing-requirements.md`](docs/listing-requirements.md) that the change implements.
- **Tests first for rules.** Write the test in [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts). Stop so the candidate can run it and see it fail. Then implement the rule in [`src/lib/moderation/rules.ts`](src/lib/moderation/rules.ts).
- **The fixtures, the mock API and the database plumbing are read-only.** `fixtures/`, `src/lib/fanvue/`, `src/lib/db/` and `app/api/v0/` are for reading only. If a rule seems to need a change there, say so and stop. The candidate may change `app/api/moderation/`, `db/migrations/` and `db/schema.ts`.
- **Never edit the spec file.** [`src/lib/moderation/spec.test.ts`](src/lib/moderation/spec.test.ts) is the acceptance criteria. If it looks wrong, say so and stop.
- **Do not choose severities, storage or triggers.** Explain the trade-offs and let the candidate pick. This covers the severity (`reject`, `fix` or `warn`), the shape of the review store, what triggers the job, and what a conflicting decision does.
- **Do not decide what the docs leave open.** A check may need a number, word list, URL pattern or interpretation that the docs do not state. Say so, offer options, and let the candidate decide.
- **Quote the doc.** When you say a rule requires something, cite the section and the sentence. The requirements are in [`docs/listing-requirements.md`](docs/listing-requirements.md) and the README's ["Acceptance criteria"](README.md#acceptance-criteria). If you cannot find it in one of those, say it is an assumption, not a rule.
- **Stay in the files listed** in the README's ["Where to work"](README.md#where-to-work) table, or in new files the candidate adds.

The candidate may edit or delete this file. If it has changed, follow the current version.
