<!-- Snapshot taken 2026-09-02 of https://api.fanvue.com/docs/app-store/listing-requirements (canonical URL).
     Vendored so the task works offline, and trimmed to the numbered rules so it can be read inside the hour.
     Wording of each rule is unchanged; the removed parts are introductory prose, the pre-submit
     checklist, and the post-launch compliance section. If this file and the live page differ, the live page wins. -->

# App Store Listing Requirements

What your app needs to be approved for the Fanvue App Store. Each rule is numbered so review feedback can cite the exact section.

## Common rejection reasons

The problems we see most often, and the rule that governs each one. Start here.

| Reason                                                                                                          | Section                                                                |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Invalid / missing / non-owned URL                                                                               | [6.2](#62-valid-owned-url)                                            |
| App doesn't use the Fanvue API                                                                                  | [6.1](#61-genuine-fanvue-integration)                                 |
| Not really an app (funnel / landing page / single-creator)                                                      | [4.1](#41-useful-apps)                                                |
| Template / copycat / AI-slop                                                                                    | [4.2](#42-originality)                                                |
| Off-platform payments / external checkout                                                                       | [3.1](#31-fanvue-payments-only), [3.2](#32-no-external-checkout)     |
| Explicit, adult, or suggestive imagery in the listing or marketing (including swimwear, underwear, or lingerie) | [1.1](#11-safe-for-work-listings)                                     |
| Broken auth / test credentials don't work                                                                       | [2.2](#22-review-access)                                              |
| Fewer than two previews / previews don't show the app                                                           | [2.3](#23-listing-quality)                                            |
| Naming (implies another platform, typo)                                                                         | [2.4](#24-app-naming)                                                 |
| Listing not in English                                                                                          | [2.3](#23-listing-quality)                                            |
| Links to / promotion of other platforms                                                                         | [1.6](#16-no-promotion-of-other-platforms)                            |
| No discoverable support channel                                                                                 | [2.6](#26-support)                                                    |
| Typos, poor layout / spacing, low-quality UI                                                                    | [4.3](#43-interface-quality), [4.4](#44-listing-and-content-quality) |

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

This rule governs the listing surface only. It does not restrict what your app does in-product, which is covered under 1.2.

### 1.2 User-generated content

If your app lets creators or fans generate, post, send, or exchange content, you are responsible for moderating that content. Your app must respect Fanvue's content policies, not bypass Fanvue moderation systems, and provide a reporting mechanism where appropriate.

### 1.3 Prohibited behaviour

Your app must not encourage, facilitate, or provide instructions for harassment, exploitation, doxxing, self-harm, violence, hate, discrimination, or any illegal activity.

### 1.4 Platform integrity

Apps must work with the Fanvue platform, not around it. Your app must not bypass or interfere with moderation systems, rate limits, platform safeguards, or security controls.

### 1.5 Honest representation

Your app must accurately represent who built it, what it does, and what data it accesses.

### 1.6 No promotion of other platforms

Your app shouldn't encourage creators or fans to leave Fanvue for another creator platform. This includes links, onboarding flows, or promotional messaging directing users to competing services.

## 2. Performance & completeness

### 2.1 Production ready

Before submitting, remove placeholder content, empty pages and dead links, fix known bugs, and make sure the app works reliably. Apps with obvious crashes or incomplete functionality won't be approved until these issues are resolved.

### 2.2 Review access

If your app requires authentication, provide everything our reviewers need to test it: working Fanvue OAuth, test credentials where required, setup instructions, and any special configuration needed during review.

### 2.3 Listing quality

Your listing should accurately represent your product.

**Required:**

* English language
* Accurate description
* Accurate pricing
* At least two screenshots showing the product in use

**Recommended:**

* 3–5 screenshots
* Highlight your primary workflows
* Avoid login screens or splash screens as previews

### 2.4 App naming

Choose a name that's unique, clear, and easy to understand. App names must not:

* imply or reference another platform, for example names built around the word "only", or names that borrow another platform's branding;
* use another company's or product's name or imagery;
* contain typos or misspellings.

### 2.5 Reliability

Apps shouldn't regularly crash, freeze, display blank screens, or leave users stuck on permanent error pages. Where something does go wrong, provide clear error messages and a path to recovery. Fanvue may request fixes, or suspend a listing, for stability problems that materially affect creators.

### 2.6 Support

Creators should always know how to get help. Provide a support email or help centre, onboarding or setup documentation, and a security contact for vulnerability reports.

### 2.7 Accuracy & integrity

Your app must deliver the features described in its listing and marketing, claims must be factual and not misleading, and any data it synchronises or displays must be accurate. It must not introduce hidden functionality, unexpected charges, or behaviour that differs materially from what the creator has consented to.

## 3. Business & payments

### 3.1 Fanvue payments only

All paid functionality must use Fanvue Payments. External payment providers aren't permitted.

### 3.2 No external checkout

Don't send creators to another website to pay for features. All purchases should happen through Fanvue.

### 3.3 Pricing

Paid plans are priced through Fanvue within the platform's supported range. Today this means setting up paid plans at one or more tiers; on-demand credit purchasing may follow later. Pricing and plan details must be accurate, with no hidden charges.

### 3.4 Commercial transparency

Creators should receive exactly what they pay for. Avoid misleading pricing, unexpected restrictions, or undisclosed limitations.

## 4. Design & quality

### 4.1 Useful apps

Your app should solve a genuine problem for creators.

Examples we'd approve: analytics, CRM, automation, AI tools, scheduling, creator productivity.

Examples we wouldn't: landing pages, sales funnels, collections of links, single-creator websites, placeholder applications.

### 4.2 Originality

Build something original. We won't approve obvious template exports, generic AI-generated products with minimal refinement, or near-identical copies of existing apps.

### 4.3 Interface quality

We don't expect every app to look identical, but we do expect a professional experience.

* **Layout**, all content fits within bounds at the sizes we display; nothing clipped or overflowing.
* **Spacing**, deliberate, consistent padding and margins; not cramped or random.
* **Typography**, legible, with a clear hierarchy and a coherent type system (roughly 2–3 weights/sizes), not clashing fonts.
* **Imagery**, crisp, appropriately sized assets; not tiny, low-resolution, or obvious low-effort "AI slop."

### 4.4 Listing and content quality

* **No typos**, in the listing, in-app copy, pricing, and plan names. Typos in pricing are a common, avoidable failure.
* **Structured pricing**, clear plan highlights and differences, not an unstructured wall of text.
* **Standard listing layout**, follow the conventional listing structure; existing approved apps are the reference.
* **Logo**, high-quality and on-brand, not a generic AI placeholder.
* **Previews**, high-quality images showing the real app in use that meet the safe-for-work bar in 1.1.

### 4.5 How we apply this bar

An isolated listing typo or a minor spacing nit on an otherwise solid app is **accept-with-fixes**: we approve and ask you to fix it, rather than rejecting. Repeated or pervasive quality problems (overflowing layouts, template sameness, multiple typos, AI-slop imagery) are a **rejection**.

## 5. Privacy & security

### 5.1 Privacy

Your app must have a publicly accessible Terms of Service and Privacy Policy, be GDPR compliant, collect only the data it needs, and restrict internal staff access to creator data to those who need it.

### 5.2 Data deletion

Creators should be able to request deletion of their data at any time. Honour deletion requests promptly.

### 5.3 Security & authentication

* Your app must **never** ask a user for their Fanvue password.
* Request only the OAuth scopes you strictly need for the documented features.
* API secrets must be stored securely on a server and never exposed in client-side code; use a secrets manager and rotate if compromised.
* All endpoints, web pages, and OAuth redirect URIs must use HTTPS with valid TLS certificates and no browser warnings.
* Handle session tokens securely as sensitive data; don't log sensitive tokens or personal data.
* Your app must be free of malware, spyware, ransomware, and any code that performs hidden, unexpected, or malicious actions (e.g. crypto-mining, ad-injection).

### 5.4 Intellectual property

Only use brands, names, and assets that you have permission to use.

## 6. Integration & listing

### 6.1 Genuine Fanvue integration

Your app should provide meaningful functionality built on the Fanvue API. We verify API usage during review.

### 6.2 Valid, owned URL

Your app must be hosted on a working domain that you own. Placeholder sites, parked domains, and Fanvue domains aren't accepted.

### 6.3 Link back to the App Store

Your app's homepage must link back to the Fanvue App Store. This can point to your app's listing once you're approved.
