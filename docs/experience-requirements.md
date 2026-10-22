# Fan Experience Requirements: moderation edition

What a fan experience must meet to stay live.

## How review works in this exercise

For this exercise, assume review works like this:

- An app publishes an experience to a creator's profile. A Fanvue reviewer approves it before fans can see it.
- After approval, edits to the title, description, cover, delivery mode or external URL go back to review. Fans keep seeing the approved version until then. These fields are listed in `pendingReviewFields`.
- Other changes go live straight away, with no review: prices, access mode, actions and the experience type.
- Fanvue keeps its own copy of every cover image, but nothing scans it.
- `LIVE_STREAM` and `LIVE_AUDIO` are labels. They do not change how an experience is delivered. An `EMBEDDED` experience runs in a frame on Fanvue's page. An `EXTERNAL` one opens the app's own site in a new tab, outside Fanvue.
- Fans can report an experience. A report has a reason and stays `OPEN` until a moderator reviews it. The same fan can report more than once.
- A moderator removes an experience by suspending it. Fans can no longer open it, and renewals pause. Nothing is deleted or refunded.

The rules below catch what review misses.

## How changes reach the tool

For this exercise, assume Fanvue sends an event each time an experience is published, changes or is reported. Each event arrives at least once, in order per experience, and carries the whole experience at that moment. [`getAllExperiences()`](../src/lib/fanvue/api.ts) is a one-off backfill that returns the final state of the replay below.

`npm run replay-events` posts the events in [`fixtures/experience-events.ts`](../fixtures/experience-events.ts) to your dev server. Each experience is published. Most are then approved and changed or reported. The replay contains these cases:

- Photography 101 lowers its monthly price while 38 fans are subscribed.
- Film Club raises its monthly price while 14 fans are subscribed ([E5](#e5-price-raised-on-paying-fans)). Zine Club raises its price with nobody subscribed.
- Private Q&A adds a paid action after approval ([E1](#e1-unreviewed-change-to-what-fans-buy)). That update is delivered twice.
- Mystery Box changes what its action sells, then a fan reports it as illegal ([E1](#e1-unreviewed-change-to-what-fans-buy), [E4](#e4-report-escalation)).
- Backstage Pass changes its cover after approval ([E2](#e2-changed-cover-not-scanned)). Lesson Pack changes its cover before it is approved.
- After Hours becomes a live stream after approval. Gym Live is a live stream served from an external site ([E3](#e3-live-content-fanvue-cannot-see)).
- Late Night Stream is reported by three fans in two days ([E4](#e4-report-escalation)). Trivia Tuesday has four reports from three fans, but never from three different fans within 7 days. One of its reports is delivered twice.
- Spin the Wheel gets an update that changes nothing a rule reads. That is not a change: nothing new to store, notify or re-queue.

## The rules

The rules read only the [event history](../fixtures/experience-events.ts). The event and experience types are in [`src/lib/fanvue/experiences.ts`](../src/lib/fanvue/experiences.ts). "After approval" means the experience was approved before the change.

### E1 Unreviewed change to what fans buy

After approval, an update adds an action, changes an action's title or description, or changes the access mode.

### E2 Changed cover not scanned

After approval, an update changes the cover (`imageUrl`). Nothing has scanned the new cover.

Cover edits go back to review, so a reviewer will still look at the new cover. What this rule adds is a flag in the queue, because no automatic check looks at it. It flags the change even while `imageUrl` is still in `pendingReviewFields`. A cover changed before the first approval is not a finding, because the first review sees it.

### E3 Live content Fanvue cannot see

- After approval, an update changes the type to `LIVE_STREAM` or `LIVE_AUDIO`.
- A `LIVE_STREAM` or `LIVE_AUDIO` experience has `deliveryMode` set to `EXTERNAL`, so it runs outside Fanvue.

A live experience that is `EMBEDDED` and was approved as live is not a finding. It runs in a frame on Fanvue's page.

### E4 Report escalation

Any report with the reason `ILLEGAL`, or reports from three or more different fans that fall within any 7-day period. Measure the period by each report's `reportedAt`. Reports from the same fan count once.

### E5 Price raised on paying fans

After approval, an update raises the experience's price (`priceCents`) while fans have live monthly access. That means `paidImpact.activeSubscriptionCount` was above 0 before the update.

### Open questions you decide

The docs do not settle these, and no named experience depends on them. Choose an answer and say why.

- E4: does a report that a moderator has already marked `REVIEWED` still count towards the three fans?
- E5: does raising an action's `priceCents` count as raising the price?
- E5: an update switches a one-time price to monthly billing (`priceRecurring` turns on). Fans who paid once are counted in `oneTimePurchaseCount`, not `activeSubscriptionCount`. Should that switch be a finding?

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
