# App Store Listing Requirements: moderation edition

**Revision 3, October 2026.** Revision 4 is due next quarter. It will change the competitor list in [1.6](#16-no-promotion-of-other-platforms) and the price ceiling in [3.3](#33-pricing-accuracy). Listings decided under this revision stay decided. The tool should be able to say which revision each finding was made under.

The sections below can be decided from the [listing data](../src/lib/fanvue/types.ts) alone. [What we do not automate](#what-we-do-not-automate) covers the rest.

***

## 1. Safety & content

### 1.6 No promotion of other platforms

A listing must not name or promote a competing creator platform. In this revision, the competing platforms are:

**OnlyFans, Fansly, Patreon, LoyalFans, ManyVids, JustForFans.**

The rule covers all copy a user can read before opening the app. That is the app name, tagline, description, description title, description body and listing highlights.

**Disguised mentions count.** A mention is disguised when it uses digits in place of letters (`0nlyFans`, `Fans1y`), separators between the words or inside a name (`only.fans`, `only-fans`, `fans-ly`, `Only Fans` used as a name), or unusual casing.

**Ordinary English is not a mention.** The words `only` and `fans` appear together in legitimate copy, such as `rewards for the only fans who tip` or `the only fans you need to message`. That is grammar, not a platform. We would rather miss a disguised name than reject a legitimate listing for its sentence structure. So a check for the separated spelling must tell the platform name from the ordinary phrase. A reviewer should be able to see what was matched.

## 2. Performance & completeness

### 2.1 Production ready

The listing copy must be finished. These markers show draft or placeholder copy: `lorem`, `ipsum`, `TODO`, `TBD`, `FIXME`, `coming soon`, `placeholder`, `sample text`.

Empty listing highlights also break this rule.

### 2.3 Listing quality

**At least two screenshots of the product.** The screenshots are `previewImageUrls`. Two entries pointing at the same image are one screenshot, not two. `heroImageUrl` is branding and `galleryImageUrls` are thumbnails. Neither counts towards the minimum.

## 3. Business & payments

### 3.3 Pricing accuracy

Pricing shown to a creator must be true and inside the range Fanvue supports. Three things break this rule:

1. **A plan priced outside the supported range.** The range and the plan lifecycle are in [Pricing Plans](pricing-plans.md). The range is in US dollars. `price` is in minor units of `currencyCode`. This tool cannot check a plan in any other currency against the range. That plan is still a finding under this rule. Do not guess an exchange rate or treat the number as dollars.
2. **A price in the copy that no plan matches.** If the listing copy quotes a price, a plan must cost that amount. Copy quotes prices in many forms, such as `$9.99 a month`, `9.99 USD`, `just $12/mo`, `from $5`.
3. **A free tier that does not exist.** If the copy advertises a free plan (`free plan`, `free tier`, `free forever`, `free to start`), the listing must have a free plan.

## 4. Design & quality

### 4.2 Originality

We will not approve the same listing twice under two names. This happens when a developer exports a template, changes the app name and the developer handle, and submits it as a new app. The description reveals it.

So originality is decided **across the store, not within one listing**. Compare each listing's description with every other listing's. Compare `description` and `descriptionBody` together, and ignore case, punctuation and the app's own name.

When two listings match, flag both. A person decides which one came first. How close two descriptions must be to count as the same listing is a judgement call. Reviewers should be able to say what they chose and why.

**Same developer and same copy is not a duplicate.** A Lite and a Pro edition of one product are fine. So is a suite of tools that share a boilerplate paragraph. Compare across developers only. Two listings with the same `developer.handle` never match each other under this rule.

### 4.5 How we apply this bar

A single typo or a small spacing problem on an otherwise good app is **accept-with-fixes**. We approve it and ask the developer to fix it, rather than reject it. Repeated or widespread quality problems are a **rejection**.

## 6. Integration & listing

### 6.2 Valid, owned URL

`appUrl` is where the app runs. It must be on a domain the developer owns. `appUrl` breaks this rule when it:

* is missing
* is not `https`
* has no host, or has an IP address for a host
* is on `fanvue.com` or any subdomain of it
* is on a domain-parking or site-builder placeholder host, or a subdomain of one. The hosts we see are `parkingcrew.net`, `sedoparking.com`, `afternic.com`, `godaddysites.com`, `wixsite.com`

Another domain with our name inside it is fine.

***

## What we do not automate

A person decides these. Nothing in the listing data settles them:

* **1.1 Safe-for-work listings.** Everything a user can see before opening the app must be safe for work. Judged from the images.
* **The rest of 2.3: accuracy and language.** Whether the description is honest about what the app does, and whether the copy is in English.
* **4.1 Useful apps.** Whether the app solves a real problem for creators, rather than being a funnel, a link collection or a single-creator site.
* **4.2 Originality, beyond near-duplicates.** Template exports and AI-generated filler that do not share copy with anything already in the store.
