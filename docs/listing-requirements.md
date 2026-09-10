<!-- Snapshot taken 2026-09-02 of https://api.fanvue.com/docs/app-store/listing-requirements (canonical URL).
     Vendored so the task works offline, and cut down so it can be read inside the hour: whole sections are
     removed, a couple of the sections that remain have had bullets removed, and the table at the top has been
     rewritten to point only at sections that remain. Section numbers follow the live page, so there are gaps.
     The wording of what remains is unchanged, apart from cross-references to sections that are not here.
     If this file and the live page differ, the live page wins. -->

# App Store Listing Requirements

What your app needs to be approved for the Fanvue App Store. Each rule is numbered so review feedback can cite the exact section.

## Common rejection reasons

The problems we see most often, and the rule that governs each one. Start here.

| Reason                                                                                                          | Section                                                            |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Fewer than two previews / previews don't show the app                                                           | [2.3](#23-listing-quality)                                        |
| Invalid / missing / non-owned URL                                                                               | [6.2](#62-valid-owned-url)                                        |
| Explicit, adult, or suggestive imagery in the listing or marketing (including swimwear, underwear, or lingerie) | [1.1](#11-safe-for-work-listings)                                 |
| Off-platform payments / external checkout                                                                       | [3.1](#31-fanvue-payments-only), [3.2](#32-no-external-checkout)  |
| Price outside the supported range                                                                               | [3.3](#33-pricing)                                                |
| Template / copycat / AI-slop                                                                                    | [4.2](#42-originality)                                            |
| Links to / promotion of other platforms                                                                         | [1.6](#16-no-promotion-of-other-platforms)                        |
| Not really an app (funnel / landing page / single-creator)                                                      | [4.1](#41-useful-apps)                                            |

***

## 1. Safety & content

### 1.1 Safe-for-work listings

Everything a user can see before they open your app must be safe for work: app name, description, logo, screenshots and preview images, and promotional material.

**The bar.** Your listing must sit comfortably in a mainstream, general-audience app store. If you'd hesitate to show a preview to a broad audience, leave it out.

Not permitted on any listing surface, including for apps aimed at adult creators:

* Nudity or partial nudity
* Lingerie, underwear, swimwear, or bikinis
* Sexualised AI-generated imagery

**Use instead.** Show the product doing its job: the real interface, dashboards, workflows, and outputs. Where a person appears, they must be fully clothed in everyday attire and shown in a non-sexual context.

This rule governs the listing surface only.

### 1.6 No promotion of other platforms

Your app shouldn't encourage creators or fans to leave Fanvue for another creator platform. This includes links, onboarding flows, or promotional messaging directing users to competing services.

## 2. Performance & completeness

### 2.1 Production ready

Before submitting, remove placeholder content, empty pages and dead links, fix known bugs, and make sure the app works reliably. Apps with obvious crashes or incomplete functionality won't be approved until these issues are resolved.

### 2.3 Listing quality

Your listing should accurately represent your product.

**Required:**

* English language
* Accurate description
* Accurate pricing
* At least two screenshots showing the product in use

## 3. Business & payments

### 3.1 Fanvue payments only

All paid functionality must use Fanvue Payments. External payment providers aren't permitted.

### 3.2 No external checkout

Don't send creators to another website to pay for features. All purchases should happen through Fanvue.

### 3.3 Pricing

Paid plans are priced through Fanvue within the platform's supported range. Today this means setting up paid plans at one or more tiers; on-demand credit purchasing may follow later. Pricing and plan details must be accurate, with no hidden charges.

## 4. Design & quality

### 4.1 Useful apps

Your app should solve a genuine problem for creators.

Examples we'd approve: analytics, CRM, automation, AI tools, scheduling, creator productivity.

Examples we wouldn't: landing pages, sales funnels, collections of links, single-creator websites, placeholder applications.

### 4.2 Originality

Build something original. We won't approve obvious template exports, generic AI-generated products with minimal refinement, or near-identical copies of existing apps.

### 4.5 How we apply this bar

An isolated listing typo or a minor spacing nit on an otherwise solid app is **accept-with-fixes**: we approve and ask you to fix it, rather than rejecting. Repeated or pervasive quality problems (overflowing layouts, template sameness, multiple typos, AI-slop imagery) are a **rejection**.

## 5. Privacy & security

### 5.3 Security & authentication

* All endpoints, web pages, and OAuth redirect URIs must use HTTPS with valid TLS certificates and no browser warnings.

## 6. Integration & listing

### 6.2 Valid, owned URL

Your app must be hosted on a working domain that you own. Placeholder sites, parked domains, and Fanvue domains aren't accepted.
