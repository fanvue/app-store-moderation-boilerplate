# Fan Experience Requirements: moderation edition

What a fan experience must meet to stay live.

## How review works in this exercise

For this exercise, assume review works like this:

- An app publishes an experience to a creator's profile. A Fanvue reviewer approves it before fans can see it.
- After approval, edits to the title, description, cover, delivery mode or external URL go back to review. Fans keep seeing the approved version until then. These fields are listed in `pendingReviewFields`.
- Other changes go live straight away, with no review: prices, access mode, actions and the experience type.
- Fanvue keeps its own copy of every cover image, but nothing scans it.
- `LIVE_STREAM` and `LIVE_AUDIO` are labels. The stream comes from the app's own page, so Fanvue never sees it.
- Fans can report an experience. A report has a reason and stays `OPEN` until a moderator reviews it. The same fan can report more than once.
- A moderator removes an experience by suspending it. Fans can no longer open it, and renewals pause. Nothing is deleted or refunded.

The rules below catch what review misses.

## How changes reach the tool

For this exercise, assume Fanvue sends an event each time an experience is published, changes or is reported. Each event carries the whole experience at that moment. [How this runs in production](production.md#experiences) has the details.

## The rules

The rules read only the [event history](../src/lib/fanvue/experiences.ts). "After approval" means the experience was approved before the change.

### E1 Unreviewed change to what fans buy

After approval, an update adds an action, changes an action's title or description, or changes the access mode.

### E2 Changed cover not scanned

After approval, an update changes the cover (`imageUrl`). Nothing has scanned the new cover.

### E3 Live content Fanvue cannot see

- After approval, an update changes the type to `LIVE_STREAM` or `LIVE_AUDIO`.
- A `LIVE_STREAM` or `LIVE_AUDIO` experience is `EXTERNAL`, so it runs outside Fanvue.

### E4 Report escalation

Any report with the reason `ILLEGAL`, or reports from three or more different fans within 7 days. Reports from the same fan count once.

### E5 Price raised on paying fans

After approval, an update raises the price or turns on monthly billing while fans have live monthly access. That means `paidImpact.activeSubscriptionCount` was above 0 before the update.

## What a finding may do

For each rule, decide which of these a finding leads to:

- **Suspend now:** fans can no longer open it, without waiting for a person.
- **Send to review:** a moderator looks at it in the review queue.
- **Notify the developer:** say what is wrong and give the developer time to fix it.

A finding is still an `Issue` with a severity of `reject`, `fix` or `warn`, because one queue holds listings and experiences.

## What we do not automate

- what a cover, an experience page or a stream shows
- whether a report is true
- whether an action is worth its price
