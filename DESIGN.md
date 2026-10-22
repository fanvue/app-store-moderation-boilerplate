# Design: experience moderation

Part two of the exercise. Experiences are live before anyone looks at them, fans pay inside them, and fans report them. Write down how the tool handles that. Short answers are fine; a diagram is fine. Code only if you have time after the design is written.

## Where the review runs

Experiences arrive one at a time, by event: published, updated, reported. Each one re-triggers review. The listing queue, by contrast, reviews a batch from a job.

- Does `reviewExperiences` run inside the events route, in something the route enqueues to, on a schedule, or somewhere else?
- What does E5 need that a single event does not carry?
- `getAllExperiences()` in the mock API is a one-off backfill of what was live before the events started flowing. Does the design need it? What happens to findings from the backfill when the first event for that experience arrives?

## What happens without a person

- For each rule in `docs/experience-requirements.md`, which does it lead to: take down now, hide pending review, or notify the developer?
- Which of those may run with nobody watching, and what does the fan who paid see when it does?
- Do `reject`, `fix` and `warn` still mean anything here, and how does each map onto those three?

## Taking down something fans paid for

A paid experience with live recurring access cannot be unpublished until the paid impact is acknowledged.

- Who acknowledges it?
- In what order do the unpublish and any refund happen?
- What if the unpublish fails halfway?

## Reports and findings in one queue

A rule finding and a fan report are different kinds of evidence.

- How do they sit in one queue, and how are they ordered against each other?
- How does E6 outrank everything else without a flood of single reports drowning the rules?

## What the record shows afterwards

Someone will ask when the tool first saw an experience, what it found, what it did and who decided.

- What is stored, and keyed by what?
- What survives a rule revision?

## Open questions

Anything you would ask before building this for real.
