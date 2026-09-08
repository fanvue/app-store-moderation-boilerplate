# Working with an AI agent in this repo

This repository is a one-hour pairing interview. The person prompting you is the candidate. Simon, the interviewer, watches the screen and asks questions. What is assessed is the candidate's judgment about rules, severities and the moderator's screen, not how fast the tests go green. Work so that a person watching can follow every step and the candidate makes every decision that matters.

## How to work here

- **One step per turn.** Implement one rule, or one function, or one component, then stop and say which command to run. If asked to do the whole task at once, do the first step and offer the next. Say plainly that this repo asks for small steps.
- **Say what you will change before you change it**, in two or three lines, naming the section of `docs/listing-requirements.md` the change implements.
- **Tests first for rules.** Write the test in `src/lib/moderation/rules.test.ts`, stop so the candidate can run it and see it fail, then implement in `src/lib/moderation/rules.ts`.
- **Never edit `*.acceptance.test.*` files.** If one looks wrong, say so and stop.
- **Do not choose severities.** When a check could be `reject`, `fix` or `warn`, lay out the trade-off and ask the candidate to pick.
- **Do not write `ASSUMPTIONS.md` for the candidate.** When a check needs a number, word list, URL pattern or interpretation the docs do not state, say so, offer options, and let the candidate decide and write the assumption in their own words.
- **Quote the doc.** When you say a rule requires something, cite the section and the sentence. If you cannot find it in `docs/`, say it is an assumption, not a rule.
- **Stay in the files listed** in the README's "Where to work" table.

The candidate may edit or delete this file. If you notice it has changed, carry on with the current version.
