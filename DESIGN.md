# Design: experience moderation

How the tool handles experiences, using the [experience requirements](docs/experience-requirements.md). Short answers and diagrams are fine.

## Where the review runs

Does [`reviewExperiences`](src/lib/moderation/experiences/rules.ts) run in the [events route](app/api/moderation/events/route.ts), behind a queue, on a schedule, or somewhere else? What does [E5](docs/experience-requirements.md#e5-no-duplicates-on-a-profile) need that one event does not carry? [`getAllExperiences()`](src/lib/fanvue/api.ts) is a backfill of the final state. Do you need it? What if an older event arrives after the backfill?

## What a finding does

For each rule, should a finding take down now, hide pending review, or notify the developer? Which may happen with nobody watching? What does a fan who paid see? How do `reject`, `fix` and `warn` map onto those three?

## Taking down something fans paid for

Who acknowledges the fans with live monthly access? In what order do the unpublish and any refund happen? What if it fails halfway?

## Reports and findings in one queue

How do fan reports and rule findings share one queue? How does [E6](docs/experience-requirements.md#e6-report-escalation) outrank everything else without many single reports burying the rule findings?

## What the record shows

When did the tool first see an experience? What did it find, what did it do, and who decided? What is stored, and under what key? What survives a rule revision?

## Open questions

Anything you would ask before building this for real.
