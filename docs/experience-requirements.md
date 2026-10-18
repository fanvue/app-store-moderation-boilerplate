<!-- Internal moderation edition. Fan experiences have no public requirements page yet; this is the
     first written version of the bar, drafted for the people doing the reviewing. Where it names a
     limit the platform already enforces, the limit is repeated here so the tool can say so rather
     than assume the platform caught it. -->

# Fan Experience Requirements — moderation edition

What a fan experience has to meet to stay live on a creator's profile, written for the people doing the reviewing. Each rule is numbered so a takedown notice can cite the exact section.

**Revision 1, October 2026.**

## Why this exists

A listing is reviewed before anyone sees it. An experience is not. An app with a creator's `write:experience` grant publishes straight onto that creator's profile, fans can open it and pay inside it the same minute, and until now nobody looked at it unless a fan complained. This document is the bar, and the tool you are building is the first thing that applies it.

Three things make this different from listing review, and the rules below are written with them in mind:

1. **It is already live.** Every finding is about something fans can open right now. The question is not whether to approve but how long it may stay up and what to do about it.
2. **Fans have paid.** A paid experience can have fans holding live monthly access. The platform blocks an unpublish while that is true until the paid impact is acknowledged, so a takedown has to decide what happens to them first.
3. **Fans report.** Fans can report an experience with a reason. A report is a second stream of signal with a different trust level from a rule, and the queue has to carry both.

## Common takedown reasons

| Reason                                                        | Section                                   |
| ------------------------------------------------------------- | ----------------------------------------- |
| An external experience we cannot send fans to                 | [E1](#e1-valid-external-url)              |
| Placeholder or draft copy on a live experience                | [E2](#e2-finished-copy)                   |
| Copy that steers fans to pay somewhere else                   | [E3](#e3-no-off-platform-payment)         |
| A price in the copy that is not what the fan is charged       | [E4](#e4-pricing-accuracy)                |
| The same experience published twice on one profile            | [E5](#e5-no-duplicates-on-a-profile)      |
| Enough fan reports to need a person now                       | [E6](#e6-report-escalation)               |

Everything in that table is decidable from the experience data. [What we do not automate](#what-we-do-not-automate) covers the rest.

***

## E1 Valid external URL

An `EXTERNAL` experience opens `externalUrl` in a new tab. The platform refuses Fanvue domains, `localhost`, IP addresses and dev tunnels at publish time; it does not refuse everything we would. We take down an `EXTERNAL` experience when the URL:

* is missing
* is not `https`
* has no host, or has an IP address for a host
* is on `fanvue.com` or any subdomain of it
* is on a link shortener, because a fan cannot see where they are going and neither can we. The ones we see: `bit.ly`, `t.co`, `tinyurl.com`, `linktr.ee`, `rb.gy`
* is on a dev tunnel that slipped past the platform check: `ngrok.io`, `ngrok-free.app`, `trycloudflare.com`, `loca.lt`

A host matches a listed domain when it is that domain or a subdomain of it.

An `EMBEDDED` experience has no `externalUrl` and this rule does not apply to it.

## E2 Finished copy

The title and description are what a fan reads before paying. Draft markers on a live experience mean nobody looked at it before it went up, and the markers are the same ones we see on listings: `lorem`, `ipsum`, `TODO`, `TBD`, `FIXME`, `coming soon`, `placeholder`, `sample text`.

## E3 No off-platform payment

Every charge inside an experience is between the fan and the creator, on the platform. Copy that steers a fan to pay somewhere else, for the experience or for anything inside it, is the most serious thing the rules can find in an experience's own copy, because it takes the fan outside every protection the platform gives them.

The rule covers the title, the description and every action's title and description. Steering looks like:

* naming a payment app or rail: `Venmo`, `CashApp`, `PayPal`, `Zelle`, `Revolut`, `Wise`, `crypto`, `BTC`, `USDT`
* an instruction to pay elsewhere: `cheaper on my site`, `DM me to pay`, `send it directly`, `pay me outside`

Naming a payment app in passing is still naming it. We would rather a person looked at ten innocent mentions than missed one that was not.

**Match whole words.** `Wise` is a payment company and also the end of `otherwise`; `crypto` is not in `cryptic`. The over-matching we accept is a whole word used innocently, not a fragment of a longer one, because under this rule a finding can lead to a takedown.

## E4 Pricing accuracy

What the copy says a fan pays has to be what the fan is charged. Three things go wrong:

1. **A price outside the supported range.** Access and every action are priced in USD cents between 300 and 50000. The platform checks this at publish; the tool checks it again because prices can be re-set from the creator's side.
2. **A price in the copy that nothing matches.** If the title or description quotes a price, either the access price or one of the actions must actually cost that. Copy quotes prices however the developer liked: `$7 a month`, `just $5`, `5 USD`, `$12/mo`.
3. **A quoted price with the wrong billing period.** The only recurring period is monthly, and only the access price can recur (`priceRecurring`); actions always charge once. A price quoted with `a month`, `monthly`, `/mo` or `per month` has to match something that bills monthly, and a price quoted as `one-off` or `once` has to match something that does not. A price quoted with no period can match either. Words with no price attached, such as `weekly draw` or `every Tuesday`, describe the schedule, not the bill.

Only a `PAID` experience has an access price. On `FREE`, `SUBSCRIPTION` and `HIDDEN` experiences `priceCents` is `null`, so a price in their copy has to match an action or it is case 2.

## E5 No duplicates on a profile

An experience is one row per app, creator and `externalExperienceId`, and publishing the same id again updates the row. A second row on the same creator's profile with the same title and the same description under a different id is a duplicate: usually an app retrying a publish with a fresh id, sometimes a creator padding their profile. Both rows are flagged, and a human decides which to keep.

Compare on `title` and `description`, ignoring case and punctuation, within one `app.uuid` and one `creator.handle`. Both have to be the same once case and punctuation are gone; a similar description is not a duplicate under this rule.

**The same app publishing the same experience for different creators is not this.** That is what apps do: a wheel app publishes a wheel on every creator who installs it. Only rows on the same profile match each other.

## E6 Report escalation

Fans report experiences with one of six reasons: `ABUSE`, `HACKED`, `ILLEGAL`, `OFFENSIVE`, `SPAM`, `STOLEN`. The platform keeps one report per reporter per experience, so every report on the record is a different person.

An experience needs a person now when:

* three or more distinct reporters have reported it, whatever the reasons, or
* any one report has the reason `ILLEGAL`.

Below that bar a report is context for a reviewer, not a finding. One fan's `SPAM` on a quiz is one fan's opinion.

This is the one rule where the finding is not about the experience's data but about what people said about it. It should outrank anything else in the queue.

***

## What a finding may do

A listing finding leads to a decision before anything is live. An experience finding is about something already live, so the vocabulary is different. For each rule, say which of these it leads to and why:

* **Take down now**: unpublish without waiting for a person. If fans hold live recurring access, the platform blocks the unpublish until the paid impact is acknowledged, and someone has to decide whether those fans are refunded.
* **Hide pending review**: remove it from the profile and chat cards, keep it reachable for fans who already paid, and put it in front of a person.
* **Notify the developer**: tell the app what is wrong and give it a window to fix it before anything else happens.

This is separate from severity. An experience finding is still an `Issue` with a severity of `reject`, `fix` or `warn`, because one queue carries both kinds and the spec checks it. Whether those three words still mean anything for something already live, and how each maps onto the actions above, is a decision to write down in `DESIGN.md`.

## What we do not automate

* **What the experience renders.** The fan surface is an iframe onto the app's own domain. Nothing in the data says what is in it.
* **Whether the cover image is safe for work.** Judged from the image.
* **Whether a reported experience is actually illegal, stolen or abusive.** E6 gets it in front of a person; the person decides.
* **Whether a priced action is worth what it costs.** A $40 mystery box is a fan's choice.
