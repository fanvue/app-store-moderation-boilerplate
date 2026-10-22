# Design: experience moderation

Experiences are live before anyone looks at them, fans pay inside them, and fans report them. Write down how the tool handles that, using the [experience requirements](docs/experience-requirements.md). Short answers and diagrams are fine.

## Where the review runs

Events arrive one at a time: published, updated, reported. Does [`reviewExperiences`](src/lib/moderation/experiences/rules.ts) run in the [events route](app/api/moderation/events/route.ts), behind a queue, on a schedule, or somewhere else? What does [E5](docs/experience-requirements.md#e5-no-duplicates-on-a-profile) need that one event does not carry? [`getAllExperiences()`](src/lib/fanvue/api.ts) returns every experience as it is now, the end state of the replay. Do you need it, and what happens when an older event arrives after it?

## What a finding does

For each rule: take down now, hide pending review, or notify the developer? Which may happen with nobody watching, and what does a fan who paid see? How do `reject`, `fix` and `warn` map onto those three?

## Taking down something fans paid for

The platform blocks an unpublish while fans hold live monthly access, until someone acknowledges them. Who does that, in what order do the unpublish and any refund happen, and what if it fails halfway?

## Reports and findings in one queue

How do fan reports and rule findings share one queue? How does [E6](docs/experience-requirements.md#e6-report-escalation) outrank everything else without a flood of single reports drowning the rules?

## What the record shows

When did the tool first see an experience, what did it find, what did it do, and who decided? What is stored, keyed by what, and what survives a rule revision?

## Open questions

Anything you would ask before building this for real.
