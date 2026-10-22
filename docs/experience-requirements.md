# Fan Experience Requirements — moderation edition

What a fan experience has to meet to stay live on a creator's profile, written for the people doing the reviewing. **Revision 1, October 2026.**

For [`DESIGN.md`](../DESIGN.md), read the first two sections and skim the rule headings.

## How experiences differ from listings

An app publishes an experience straight onto a creator's profile, with no review step.

- **It is already live.** The question is not whether to approve it, but how long it may stay up.
- **Fans have paid.** A paid experience can have fans holding live monthly access (`activeSubscribers`). The platform blocks an unpublish until someone acknowledges them, so a takedown has to decide what happens to those fans first.
- **Fans report.** A report is a second kind of signal, trusted differently from a rule. The queue carries both.

Fans can buy actions inside any experience. A `HIDDEN` experience is not listed on the profile and is reachable by share link only.

## What a finding may do

For each rule, decide which of these a finding leads to:

- **Take down now:** unpublish without waiting for a person.
- **Hide pending review:** a moderation hold, not the app's `hidden` flag. Take it off the profile, keep it open for fans who already paid, and put it in front of a person.
- **Notify the developer:** say what is wrong and give the app time to fix it.

A finding is still an `Issue` with a severity of `reject`, `fix` or `warn`, because one queue carries listings and experiences. How those map onto the three actions goes in `DESIGN.md`.

## The rules

Everything here is decidable from the [experience data](../src/lib/fanvue/experiences.ts).

### E1 Valid external URL

An `EXTERNAL` experience's `externalUrl` breaks this rule when it is missing, is not `https`, has no host or an IP address for a host, or is on one of these domains or a subdomain of one:

- `fanvue.com`
- link shorteners: `bit.ly`, `t.co`, `tinyurl.com`, `linktr.ee`, `rb.gy`
- dev tunnels: `ngrok.io`, `ngrok-free.app`, `trycloudflare.com`, `loca.lt`

### E2 Finished copy

The title or description contains a draft marker, ignoring case: `lorem`, `ipsum`, `TODO`, `TBD`, `FIXME`, `coming soon`, `placeholder`, `sample text`.

### E3 No off-platform payment

The title, the description, or any action's title or description steers a fan to pay somewhere else. That means naming a payment app or rail (`Venmo`, `CashApp`, `PayPal`, `Zelle`, `Revolut`, `Wise`, `crypto`, `BTC`, `USDT`) or an instruction such as `cheaper on my site`, `DM me to pay`, `send it directly` or `pay me outside`.

Match whole words, ignoring case: `Wise` is not in `otherwise`. A mention in passing still counts. This is the most serious thing a rule can find in an experience's copy, because it takes the fan outside the platform's protections.

### E4 Pricing accuracy

What the copy says a fan pays has to be what the fan is charged.

1. The access price, when there is one, and every action are USD cents from 300 to 50000 inclusive. Prices can be re-set after publish, so the tool checks again.
2. A price quoted in the experience's title or description, such as `$7 a month`, `just $5`, `5 USD` or `$12/mo`, equals the access price or an action's price. Only `PAID` experiences have an access price; otherwise `priceCents` is `null`.
3. The billing period matches. Only the access price can recur (`priceRecurring`), and only monthly; actions charge once. `a month`, `monthly`, `/mo` or `per month` must match a monthly charge, `one-off` or `once` a one-time charge, and a price with no period can match either. Words like `weekly draw` or `every Tuesday` are a schedule, not a price.

### E5 No duplicates on a profile

Two experiences with the same `app.uuid` and `creator.handle`, different `externalExperienceId`s, and the same title and description once case and punctuation are ignored. Flag both; a person decides which to keep. The same app publishing the same experience for different creators is normal.

### E6 Report escalation

Three or more reports, whatever the reasons, or any one report with the reason `ILLEGAL`. Each report is from a different fan. Below that bar a report is context for a reviewer, not a finding. E6 should outrank everything else in the queue.

## What we do not automate

What the experience shows inside its iframe, whether the cover image is safe for work, whether a reported experience really is illegal, stolen or abusive, and whether an action is worth its price.
