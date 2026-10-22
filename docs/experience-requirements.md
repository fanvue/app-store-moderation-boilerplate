# Fan Experience Requirements — moderation edition

**Revision 1, October 2026.** What a fan experience has to meet to stay live on a creator's profile. Rules are numbered so a takedown notice can cite the section.

For [`DESIGN.md`](../DESIGN.md), read the first two sections, [How experiences differ](#how-experiences-differ-from-listings) and [What a finding may do](#what-a-finding-may-do), and skim the rule headings. The rule details matter when you code one.

## How experiences differ from listings

An app with a creator's `write:experience` grant publishes straight onto that creator's profile. There is no review step.

- **It is already live.** Every finding is about something fans can open right now. The question is not whether to approve it, but how long it may stay up and what to do about it.
- **Fans have paid.** A paid experience can have fans holding live monthly access ([`activeSubscribers`](../src/lib/fanvue/experiences.ts)). The platform blocks an unpublish until that paid impact is acknowledged, so a takedown has to decide first what happens to those fans.
- **Fans report.** A report is a second stream of signal, with a different trust level from a rule. The queue has to carry both.

Fans can buy actions inside an experience whatever its access mode. A `HIDDEN` experience is never listed on the profile and is reachable by share link only.

## What a finding may do

For each rule, decide which of these a finding leads to, and why:

- **Take down now.** Unpublish without waiting for a person. If fans hold live recurring access, someone has to acknowledge it and decide whether they are refunded.
- **Hide pending review.** A moderation hold, not the app's own `hidden` flag. Remove it from the creator's profile and anywhere it is promoted, keep it reachable for fans who already paid, and put it in front of a person.
- **Notify the developer.** Tell the app what is wrong and give it a window to fix it.

An experience finding is still an `Issue` with a severity of `reject`, `fix` or `warn`, because one queue carries listings and experiences and the spec checks it. Whether those words still mean anything here, and how each maps onto the three actions, goes in [`DESIGN.md`](../DESIGN.md).

## The rules

Everything here is decidable from the [experience data](../src/lib/fanvue/experiences.ts).

### E1 Valid external URL

Applies to `EXTERNAL` experiences only. A finding when `externalUrl`:

- is missing, is not `https`, or has no host or an IP address for a host
- is on `fanvue.com`
- is on a link shortener: `bit.ly`, `t.co`, `tinyurl.com`, `linktr.ee`, `rb.gy`
- is on a dev tunnel: `ngrok.io`, `ngrok-free.app`, `trycloudflare.com`, `loca.lt`

A host matches a listed domain when it is that domain or a subdomain of it.

### E2 Finished copy

A finding when the title or description contains a draft marker, ignoring case: `lorem`, `ipsum`, `TODO`, `TBD`, `FIXME`, `coming soon`, `placeholder`, `sample text`.

### E3 No off-platform payment

A finding when the title, the description, or any action's title or description steers a fan to pay somewhere else:

- naming a payment app or rail: `Venmo`, `CashApp`, `PayPal`, `Zelle`, `Revolut`, `Wise`, `crypto`, `BTC`, `USDT`
- an instruction to pay elsewhere, ignoring case: `cheaper on my site`, `DM me to pay`, `send it directly`, `pay me outside`

This is the most serious thing a rule can find in an experience's own copy, because it takes the fan outside every protection the platform gives them. A mention in passing still counts. Match whole words only: `Wise` is not in `otherwise`, and `crypto` is not in `cryptic`.

### E4 Pricing accuracy

What the copy says a fan pays has to be what the fan is charged.

1. **Range.** The access price, when there is one, and every action are USD cents from 300 to 50000 inclusive. The platform checks this at publish; prices can be re-set later from the creator's side, so the tool checks again.
2. **A quoted price must match.** A price in the experience's title or description, such as `$7 a month`, `just $5`, `5 USD` or `$12/mo`, must equal the access price or an action's price. Only `PAID` experiences have an access price; on the others `priceCents` is `null`.
3. **The billing period must match.** Only the access price can recur (`priceRecurring`), and only monthly. Actions always charge once.
   - `a month`, `monthly`, `/mo` or `per month` must match a monthly charge.
   - `one-off` or `once` must match a one-time charge.
   - A price with no period can match either.
   - Schedule words with no price, such as `weekly draw` or `every Tuesday`, are not prices.

### E5 No duplicates on a profile

A finding on both rows when two experiences share an `app.uuid` and a `creator.handle`, have different `externalExperienceId`s, and have the same title and the same description once case and punctuation are ignored. A similar description is not enough. A human decides which to keep.

The same app publishing the same experience for different creators is normal and not a duplicate.

### E6 Report escalation

Reports carry one of six reasons: `ABUSE`, `HACKED`, `ILLEGAL`, `OFFENSIVE`, `SPAM`, `STOLEN`. The platform keeps one report per fan per experience, so every report is a different person.

A finding when there are three or more reports, whatever the reasons, or any one report with the reason `ILLEGAL`. Below that bar a report is context for a reviewer, not a finding.

E6 is about what people said, not the experience's data. It should outrank everything else in the queue. How is a [`DESIGN.md`](../DESIGN.md#reports-and-findings-in-one-queue) question.

## What we do not automate

What the experience renders inside its iframe, whether the cover image is safe for work, whether a reported experience really is illegal, stolen or abusive, and whether a priced action is worth its price.
