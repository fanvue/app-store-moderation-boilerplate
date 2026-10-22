# Working with an AI agent in this repo

This repository is a pairing interview. The person prompting you is the candidate. The interviewer watches the screen and asks questions. What is assessed is the candidate's judgment about rules, severities, the moderator's screen and the design for experiences, not how fast the tests go green. Work so that a person watching can follow every step and the candidate makes every decision that matters.

## How to work here

- **One step per turn.** Implement one rule, or one function, or one component, then stop and say which command to run. If asked to do the whole task at once, do the first step and offer the next. Say plainly that this repo asks for small steps.
- **Say what you will change before you change it**, in two or three lines, naming the section of [`docs/listing-requirements.md`](docs/listing-requirements.md) or [`docs/experience-requirements.md`](docs/experience-requirements.md) the change implements.
- **Tests first for rules.** Write the test in [`src/lib/moderation/rules.test.ts`](src/lib/moderation/rules.test.ts) (or [`src/lib/moderation/experiences/rules.test.ts`](src/lib/moderation/experiences/rules.test.ts)), stop so the candidate can run it and see it fail, then implement in the matching `rules.ts`.
- **The fixtures, the mock API and the database plumbing are read-only.** `fixtures/`, `src/lib/fanvue/`, `src/lib/db/` and `app/api/v0/` are there to be read. If a rule seems to need a change there, say so and stop. `app/api/moderation/` and `db/migrations/` are the candidate's.
- **Never edit the spec files.** [`src/lib/moderation/spec.test.ts`](src/lib/moderation/spec.test.ts) and [`src/lib/moderation/experiences/spec.test.ts`](src/lib/moderation/experiences/spec.test.ts) are the acceptance criteria. If one looks wrong, say so and stop.
- **Do not choose severities, storage or triggers.** When a check could be `reject`, `fix` or `warn`, or for experiences take down, hide or notify, lay out the trade-off and ask the candidate to pick. The same goes for the shape of the review store, what triggers the job, and what a conflicting decision does: offer the options, let the candidate choose.
- **Do not write [`ASSUMPTIONS.md`](ASSUMPTIONS.md) or [`DESIGN.md`](DESIGN.md) for the candidate.** When a check needs a number, word list, URL pattern or interpretation the docs do not state, or when a design section needs an answer, say so, offer options, and let the candidate decide and write it in their own words.
- **Quote the doc.** When you say a rule requires something, cite the section and the sentence. If you cannot find it in `docs/`, say it is an assumption, not a rule.
- **Stay in the files listed** in the README's ["Where to work"](README.md#where-to-work) table.

The candidate may edit or delete this file. If you notice it has changed, carry on with the current version.
