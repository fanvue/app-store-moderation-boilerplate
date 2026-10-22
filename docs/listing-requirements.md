# App Store Listing Requirements: moderation edition

**Revision 3, October 2026.** Revision 4 is due next quarter and will change the competitor list in [1.6](#16-no-promotion-of-other-platforms) and the price ceiling in [3.3](#33-pricing-accuracy). Listings decided under this revision stay decided; the tool should be able to say which revision a finding was made under.

The sections below are decidable from the [listing data](../src/lib/fanvue/types.ts) alone. [What we do not automate](#what-we-do-not-automate) covers the rest.

***

## 1. Safety & content

### 1.6 No promotion of other platforms

A listing must not name or promote a competing creator platform. As of this revision the platforms we treat as competing are:

**OnlyFans, Fansly, Patreon, LoyalFans, ManyVids, JustForFans.**

The rule covers every piece of copy a user can read before opening the app: the app name, tagline, description, description title and body, and the listing highlights.

**Disguised mentions count:** digits standing in for letters (`0nlyFans`, `Fans1y`), separators inserted between the words (`only.fans`, `only-fans`, `Only Fans` used as a name), or unusual casing.

**Ordinary English is not a mention.** The words `only` and `fans` occur together in legitimate copy: `rewards for the only fans who tip`, `the only fans you need to message`. That is grammar, not a platform. We would rather miss a disguised name than reject a legitimate listing for its sentence structure, so a check for the separated spelling has to tell the proper noun from the phrase, and a reviewer should be able to see what was matched.

## 2. Performance & completeness

### 2.1 Production ready

The listing copy must be finished. These markers mean draft or placeholder copy: `lorem`, `ipsum`, `TODO`, `TBD`, `FIXME`, `coming soon`, `placeholder`, `sample text`.

Empty listing highlights also break this rule.

### 2.3 Listing quality

**At least two screenshots of the product.** The screenshots are `previewImageUrls`. Two entries pointing at the same image are one screenshot, not two. `heroImageUrl` is branding and `galleryImageUrls` are thumbnails; neither counts towards the minimum.

## 3. Business & payments

### 3.3 Pricing accuracy

Pricing shown to a creator must be true and inside the range Fanvue supports. Three things break this rule:

1. **A plan priced outside the supported range.** The range, and the plan lifecycle, are in [Pricing Plans](pricing-plans.md). The range is stated in US dollars and `price` is in minor units of `currencyCode`. A plan in any other currency cannot be checked against the range by this tool. It is still a finding under this rule: do not guess an exchange rate or treat the number as dollars.
2. **A price in the copy that no plan matches.** If the listing copy quotes a price, a plan must actually cost that. Copy quotes prices in many forms: `$9.99 a month`, `9.99 USD`, `just $12/mo`, `from $5`.
3. **A free tier that does not exist.** Copy advertising a free plan (`free plan`, `free tier`, `free forever`, `free to start`) needs a free plan on the listing.

## 4. Design & quality

### 4.2 Originality

We will not approve the same listing twice under two names: a developer exports a template, changes the app name and the developer handle, and submits it as a new app. The giveaway is the description.

So originality is decided **across the store, not within one listing**: a listing's description is compared against every other listing's. Compare `description` and `descriptionBody` together, ignoring case, punctuation and the app's own name.

Two listings that match each other are both flagged; a human decides which of them was first. How close two descriptions have to be before they count as the same listing is a judgement, and reviewers should be able to say what they settled on and why.

**Same developer, same copy, is not a duplicate.** A Lite and a Pro edition of one product, or a suite of tools sharing a boilerplate paragraph, is fine. Compare across developers only: two listings under the same `developer.handle` never match each other under this rule.

### 4.5 How we apply this bar

An isolated listing typo or a minor spacing nit on an otherwise solid app is **accept-with-fixes**: we approve and ask the developer to fix it, rather than rejecting. Repeated or pervasive quality problems are a **rejection**.

## 6. Integration & listing

### 6.2 Valid, owned URL

`appUrl` is where the app runs, and it must be on a domain the developer owns. `appUrl` breaks this rule when it:

* is missing
* is not `https`
* has no host, or has an IP address for a host
* is on `fanvue.com` or any subdomain of it
* is on a domain-parking or site-builder placeholder host, or a subdomain of one. The ones we see: `parkingcrew.net`, `sedoparking.com`, `afternic.com`, `godaddysites.com`, `wixsite.com`

A domain that merely has our name inside it is fine.

***

## What we do not automate

These are decided by a person. Nothing in the listing data settles them:

* **1.1 Safe-for-work listings.** Everything a user can see before opening the app must be safe for work. Judged from the images.
* **2.3, the rest of it: accuracy and language.** Whether the description is honest about what the app does, and whether the copy is English.
* **4.1 Useful apps.** Whether the app solves a real problem for creators, rather than being a funnel, a link collection or a single-creator site.
* **4.2 Originality, beyond near-duplicates.** Template exports and AI slop that do not share copy with anything already in the store.
