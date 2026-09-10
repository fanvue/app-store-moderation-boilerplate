<!-- Internal moderation edition. Section numbers follow the public Listing Requirements page
     (https://api.fanvue.com/docs/app-store/listing-requirements), so there are gaps: only the sections
     the review tool is expected to cover are reproduced in full. Wording here is written for reviewers,
     which is why it is more specific than the public page. If this file and the public page differ for a
     developer-facing question, the public page wins. -->

# App Store Listing Requirements — moderation edition

What an app needs to be approved for the Fanvue App Store, written for the people doing the reviewing. Each rule is numbered so review feedback can cite the exact section.

## Common rejection reasons

The problems we see most often, and the rule that governs each one.

| Reason                                                          | Section                                        |
| --------------------------------------------------------------- | ---------------------------------------------- |
| Placeholder or draft copy left in the listing                    | [2.1](#21-production-ready)                    |
| Fewer than two screenshots of the product                        | [2.3](#23-listing-quality)                     |
| Pricing in the copy that does not match the plans                | [3.3](#33-pricing-accuracy)                    |
| A price outside the supported range                              | [3.3](#33-pricing-accuracy)                    |
| Naming or promoting another creator platform                     | [1.6](#16-no-promotion-of-other-platforms)     |
| A description that is a near-copy of another listing             | [4.2](#42-originality)                         |
| An app URL we cannot accept                                      | [6.2](#62-valid-owned-url)                     |

Everything in that table is decidable from the listing data alone. [What we do not automate](#what-we-do-not-automate) covers the rest.

***

## 1. Safety & content

### 1.6 No promotion of other platforms

A listing must not name or promote a competing creator platform. As of this revision the platforms we treat as competing are:

**OnlyFans, Fansly, Patreon, LoyalFans, ManyVids, JustForFans.**

The rule covers every piece of copy a user can read before opening the app: the app name, tagline, description, description title and body, and the listing highlights.

**Disguised mentions count.** Developers know we look for these names, so reviewers regularly see them written to defeat a search: digits standing in for letters (`0nlyFans`, `Fans1y`), separators inserted between the words (`only.fans`, `Only Fans`, `only-fans`), or unusual casing. A name written any of these ways is still that name.

## 2. Performance & completeness

### 2.1 Production ready

The listing copy must be finished. A listing still carrying draft or placeholder content is not ready for review, and the markers we see are consistent: `lorem`, `ipsum`, `TODO`, `TBD`, `FIXME`, `coming soon`, `placeholder`, `sample text`.

Empty listing highlights are the other common sign of a listing submitted half-written.

### 2.3 Listing quality

**At least two screenshots of the product.** The screenshots are `previewImageUrls`. Two entries pointing at the same image are one screenshot, not two: reviewers see the same file padded out to hit the minimum. `heroImageUrl` is branding and `galleryImageUrls` are thumbnails; neither counts towards the minimum.

## 3. Business & payments

### 3.3 Pricing accuracy

Pricing shown to a creator must be true, and it must be inside the range Fanvue supports. Three things go wrong:

1. **A plan priced outside the supported range.** The range, and the plan lifecycle, are in [Pricing Plans](pricing-plans.md).
2. **A price in the copy that no plan matches.** If the listing copy quotes a price, a plan must actually cost that. Copy quotes prices in whatever form the developer felt like: `$9.99 a month`, `9.99 USD`, `just $12/mo`, `from $5`.
3. **A free tier that does not exist.** Copy advertising a free plan (`free plan`, `free tier`, `free forever`, `free to start`) needs a free plan on the listing.

## 4. Design & quality

### 4.2 Originality

We will not approve the same listing twice under two names. This is the failure mode: a developer exports a template, changes the app name and the developer handle, and submits the result as a new app. The giveaway is the description.

So originality is decided **across the store, not within one listing**: a listing's description is compared against every other listing's. Compare on `description` and `descriptionBody`, ignoring case, punctuation and the app's own name — the name is the one thing they always change.

Two listings that match each other are both flagged; a human decides which of them was first. How close two descriptions have to be before they count as the same listing is a judgement, and reviewers should be able to say what they settled on and why.

### 4.5 How we apply this bar

An isolated listing typo or a minor spacing nit on an otherwise solid app is **accept-with-fixes**: we approve and ask the developer to fix it, rather than rejecting. Repeated or pervasive quality problems are a **rejection**.

## 6. Integration & listing

### 6.2 Valid, owned URL

`appUrl` is where the app actually runs, and it must be a working address on a domain the developer owns. We reject a listing when the URL:

* is missing
* is not `https` — an app served over plain HTTP is not approvable
* has no host, or has an IP address for a host
* is on `fanvue.com` or any subdomain of it — the app must not be hosted on our domain
* is on a domain-parking or site-builder placeholder host. The ones we see: `parkingcrew.net`, `sedoparking.com`, `afternic.com`, `godaddysites.com`, `wixsite.com`

A domain that merely has our name inside it is fine. Plenty of legitimate tools are called something-fanvue-something, and third-party developers are allowed to say what their app is for.

***

## What we do not automate

These rules are in the public requirements and are decided by a person looking at the listing. Nothing in the listing data settles them, so the tool should not pretend to:

* **1.1 Safe-for-work listings.** Everything a user can see before opening the app must be safe for work. Judged from the images.
* **2.3 Accuracy and language.** Whether the description is honest about what the app does, and whether the copy is English.
* **4.1 Useful apps.** Whether the app solves a real problem for creators, rather than being a funnel, a link collection or a single-creator site.
* **4.2 Originality, beyond near-duplicates.** Template exports and AI slop that do not share copy with anything already in the store.
