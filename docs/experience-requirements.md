# Fan Experience Requirements: moderation edition

What a fan experience must meet to stay live. For [`DESIGN.md`](../DESIGN.md), read the first two sections and skim the rule headings.

## How experiences differ from listings

An experience is an embedded page on Fanvue that an app publishes to a creator's profile, like a game or a live stream. It is live immediately, and nobody reviews it first.

- **It is already live.** The question is how long it may stay up, not whether to approve it.
- **Fans have paid.** A paid experience can have fans with live monthly access (`activeSubscribers`). Fanvue will not unpublish it until someone acknowledges those fans, so a takedown must first decide what happens to them.
- **Fans report.** A report is a second kind of signal, trusted differently from a rule. The queue holds both.

Fans can buy actions inside any experience. A `HIDDEN` experience is not listed on the profile. Fans can reach it only by share link.

## What a finding may do

For each rule, decide which of these a finding leads to:

- **Take down now:** unpublish without waiting for a person.
- **Hide pending review:** a moderation hold, not the app's `hidden` flag. Remove it from the profile, keep it open for fans who already paid, and send it to a person.
- **Notify the developer:** say what is wrong and give the developer time to fix it.

A finding is still an `Issue` with a severity of `reject`, `fix` or `warn`, because one queue holds listings and experiences.

## The rules

These rules need only the [experience data](../src/lib/fanvue/experiences.ts).

### E1 Valid external URL

An `EXTERNAL` experience's `externalUrl` breaks this rule when it is missing, is not `https`, has no host or an IP address for a host, or is on one of these domains or a subdomain of one:

- `fanvue.com`
- link shorteners: `bit.ly`, `t.co`, `tinyurl.com`, `linktr.ee`, `rb.gy`
- dev tunnels: `ngrok.io`, `ngrok-free.app`, `trycloudflare.com`, `loca.lt`

### E2 Finished copy

The title or description contains a draft marker, ignoring case: `lorem`, `ipsum`, `TODO`, `TBD`, `FIXME`, `coming soon`, `placeholder`, `sample text`.

### E3 No off-platform payment

The title, the description, or any action's title or description tells a fan to pay somewhere else. That means naming a payment app or method (`Venmo`, `CashApp`, `PayPal`, `Zelle`, `Revolut`, `Wise`, `crypto`, `BTC`, `USDT`) or an instruction such as `cheaper on my site`, `DM me to pay`, `send it directly` or `pay me outside`.

Match whole words and ignore case. `Wise` does not match inside `otherwise`. A mention in passing still counts.

### E4 Pricing accuracy

What the copy says a fan pays must be what the fan is charged.

1. The access price, if there is one, and every action's price are from 300 to 50000 USD cents inclusive.
2. A price quoted in the experience's title or description, such as `$7 a month`, `just $5`, `5 USD` or `$12/mo`, equals the access price or an action's price. Only `PAID` experiences have an access price. For other experiences, `priceCents` is `null`.
3. The billing period matches. Only the access price can recur (`priceRecurring`), and only monthly. Actions charge once. `a month`, `monthly`, `/mo` or `per month` must match a monthly charge. `one-off` or `once` must match a one-time charge. A price with no period can match either. Words like `weekly draw` or `every Tuesday` are a schedule, not a price.

### E5 No duplicates on a profile

Two experiences with the same `app.uuid` and `creator.handle`, different `externalExperienceId`s, and the same title and description, ignoring case and punctuation. Flag both. A person decides which to keep. The same app publishing the same experience for different creators is normal.

### E6 Report escalation

Three or more reports for any reason, or one report with the reason `ILLEGAL`. Each report is from a different fan. Below that, a report is context for a reviewer, not a finding. E6 should outrank everything else in the queue.

## What we do not automate

- what the experience shows inside its iframe
- whether the cover image is safe for work
- whether a reported experience really is illegal, stolen or abusive
- whether an action is worth its price
