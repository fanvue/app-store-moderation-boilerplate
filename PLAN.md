# Plan: App Store moderation

**Status: locked (27 October 2026).** Tickets are simulated Linear issues (`MOD-n`). Every design decision below is settled. The one choice left open is which rule MOD-8 adds, and its severity.

**Edge cases are out of scope.** Where the plan meets one, it takes whatever the simplest implementation does, and says so.

---

## Why the pages are slow: hypotheses

| #   | Hypothesis                                                                                                                                                                                                                                | Evidence                                                                                                                                                                                                                       | Status                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| H1  | **The work happens when a page is read, when it should happen when data changes.** Both pages call `fetchEveryListing()` and `reviewListings()` inside the request, with `dynamic = "force-dynamic"`. Nothing is stored, so every load pays again. | `app/page.tsx:18`, `app/listings/[uuid]/page.tsx:19`                                                                                                                                                                           | Confirmed by reading the code  |
| H2  | **The fetch is 2,056 calls made one after another.** `fetchEveryListing` awaits each `getApp` inside a loop, with no concurrency.                                                                                                          | Measured: 2,056 calls take 7,162 ms at the default 3 ms latency, and 28 ms at 0 ms. Almost all of the fetch time is waiting on latency, one call at a time.                                                                     | Confirmed (measured)           |
| H3  | **Concurrency would only fix the mock.** The live API allows 200 calls a minute, so 2,056 calls take about 10 minutes however they are made. No page load can do that. Storing the results is the only real fix. H2 only matters to the job. | README, "The task" 1                                                                                                                                                                                                          | Follows from the README        |
| H4  | **The rest of the 15–25 s is rendering.** The queue renders all 2,015 rows in one table (`ReviewQueue.tsx`). That makes a large HTML/RSC payload, plus Turbopack compiling on the first hit.                                                | Fetch plus rules come to about 7.2 s, and the README says 15–25 s. The gap is not measured yet.                                                                                                                               | Not verified: profile once dev runs |
| H5  | **The listing page reviews the whole store to show one listing.** It needs the whole set only because 4.2 compares listings to each other. A stored review removes the need.                                                              | `app/listings/[uuid]/page.tsx:20`                                                                                                                                                                                              | Confirmed by reading the code  |
| H6  | **The rules are cheap today but will not stay cheap.** `reviewListings` takes about 1 ms for 2,015 listings with only 2.3 in it. 4.2 compares every pair, about 2 million comparisons, which is fine in a job and wrong in a request.        | Measured: review takes 1–2 ms                                                                                                                                                                                                  | Confirmed for today            |
| H7  | **Sorting by severity has to come from our own index.** `GET /apps` is in submission order and cannot filter, so "most serious first, across all pages" needs a stored severity rank plus the submission position.                          | README, "The task" 1; `store.ts` `getQueuePage` contract                                                                                                                                                                       | Follows from the README        |

**Conclusion:** derive reviews in a background job, store them in Postgres, and have the pages read one page or one row. That is what the README asks for. The tickets below break it down.

**Architecture (decided): pre-generate, then keep fresh with events.**
- **Data is generated ahead of time, never on request.**
- **Backfill:** a one-off job (MOD-4, `npm run review`) fetches every listing, reviews it and stores the results.
- **Freshness is event-driven:** each change event updates only what it affects (MOD-9). The README's event is "Editing a listing or a pricing plan starts a new submission, and a webhook reports it."
  1. Fetch the one changed listing.
  2. Re-review it against the stored set, because 4.2 can change other listings.
  3. Save the reviews that changed, and apply the position rule from MOD-2.
- **Events:**
  - **Developer submission or edit**, reported by the webhook (MOD-9). Steps 1–3 above.
  - **A new rules revision** is handled by re-running `npm run review`. There is no special event for it.

**Hard constraint:** there should be no API call in the frontend. The queue and listing pages read only from Postgres, through the store. They import nothing from `@/lib/fanvue/api`, and nothing like `fetchEveryListing`. Nothing falls back to the API when data is missing: a missing row is shown as "Not reviewed yet", never fetched on demand. Only the job (MOD-4) and the webhook (MOD-9) talk to the Fanvue API.

**Setup note:** `node_modules` is not installed yet. Run `npm i` before anything else.

---

## Tickets

### MOD-1 Read the requirements revision from the doc

- **Why:** the doc says, "The tool should be able to say which revision each finding was made under" (header of `docs/listing-requirements.md`). `review-job.ts` says nothing holds it yet.
- **Locked: `docs/listing-requirements.md` is the source.**
  - The job reads the doc and takes the revision from its header line, `**Revision 3, October 2026.**`, storing `"3"`.
  - If the line is missing, the job fails loudly rather than storing a guess.
  - The revision cannot drift from the doc. A revision 4 edit to the doc is picked up by the next `npm run review`.
- **Where it is stored:** `review_runs.rule_revision` for the run, and `reviews.rule_revision` for each listing. So each finding's revision comes through its review row.
- **The pages never read the doc.** They show the stored value, which keeps them free of file and API reads.
- **Done when:** a small `readRuleRevision()` used by the job returns `"3"` for the current doc.

### MOD-2 Schema: `listings`, `reviews` and `findings` (migration `0002_listings_reviews_findings.ts` + `db/schema.ts`)

- **Why:** the acceptance criterion "The queue and the listing page read from your store and make no API calls", and H1, H7.
- **Done when:** one migration creates the tables, `db/schema.ts` types them, and `npm run dev` applies it.
- **Decided:**
  - **Fetched and derived data are kept apart.**
    - `listings` holds what we fetched from the Fanvue API.
    - `reviews` holds what our rules derived from it, one row per listing.
    - `findings` holds one row per issue.

    A webhook edit replaces one listing's row, but through 4.2 it can change several listings' reviews.
  - **No `jsonb` unless it is absolutely necessary.** The fields the queue displays are real columns. String arrays use Postgres `text[]`, which is a native type, not `jsonb`.
  - **Unreviewed listings sort to the top** of the queue (`nulls first`).
  - **Queue row shape:** ignored for now. `QueuePage.rows` stays `Review[]`.
  - **Any change in a listing's worst severity moves it to the end of submission order.** This includes 4.2 knock-ons, where an edit to listing A changes listing B's severity. If the worst severity stays the same, the listing keeps its place. Consequences:
    - **We own `position`, not the API.**
      - The job sets `position` the first time it sees a listing, in `GET /apps` order on the first run and as `max(position) + 1` after that.
      - Later full runs must not reset it: the upsert updates every column except `position`.
    - **Whoever saves reviews applies the move.** Inside the save transaction, compare each listing's old `severity_rank` with its new one.
      - Every listing whose rank changed gets `max(position) + 1`, `+ 2` and so on.
      - Listings that move together keep their previous relative order.
      - Appending new maximums avoids swapping two rows under `unique`.
      - Because the move lives in the store's save, the job and the event handler (MOD-9) behave the same way.
      - A listing with no earlier review has nothing to compare against, so its first review doesn't move it.
      - A full re-run after a rules revision gets no special case: the same rule applies.

**Sketch (column names not final):**

```sql
listings (
  uuid                uuid primary key,
  position            integer not null unique,  -- ours: set on first sight, moved to the end when worst severity changes
  -- from GET /apps (the 41 list calls)
  name                text not null,
  tagline             text not null,
  description         text not null,
  logo_url            text not null,
  app_url             text,
  pricing_type        text not null check (pricing_type in ('free', 'monthly')),
  rating_average      numeric,
  rating_count        integer,
  developer_name      text,
  developer_handle    text,
  -- from GET /apps/{uuid}; null until the detail call
  description_title   text,
  description_body    text,
  highlights          text[],
  hero_image_url      text,
  preview_image_urls  text[],
  gallery_image_urls  text[],
  fetched_at          timestamptz not null,
  detail_fetched_at   timestamptz             -- null = detail not fetched yet
)

listing_pricing_plans (                       -- full listing normalised; no jsonb
  uuid           uuid primary key,
  listing_uuid   uuid not null references listings(uuid) on delete cascade,
  sort_order     smallint not null,           -- keeps pricingPlans[n] stable for findings' `field`
  name           text not null,
  description    text,
  billing_type   text not null check (billing_type in ('free', 'one_time', 'recurring')),
  interval       text check (interval in ('monthly', 'yearly')),
  price          integer not null,            -- minor units of currency_code
  currency_code  text not null,
  status         text not null check (status in ('pending_setup', 'active', 'withdrawn')),
  highlights     text[] not null
)

reviews (
  listing_uuid   uuid primary key references listings(uuid) on delete cascade,
  run_id         bigint not null references review_runs(id),
  rule_revision  text not null,               -- each finding's revision comes through this row (MOD-1)
  severity_rank  smallint not null,           -- 0 reject, 1 fix, 2 warn, 3 none
  reviewed_at    timestamptz not null
)

findings (
  id                    bigserial primary key,
  listing_uuid          uuid not null references reviews(listing_uuid) on delete cascade,
  code                  text not null,
  rule                  text not null,        -- "2.3"
  severity              text not null check (severity in ('reject', 'fix', 'warn')),
  message               text not null,
  field                 text,                 -- "appUrl", "pricingPlans[0].price"
  evidence              text,                 -- the text that triggered it (MOD-7)
  related_listing_uuid  uuid references listings(uuid)  -- the other half of a 4.2 pair
)
index findings (listing_uuid)
index findings (rule)
```

**What follows from this shape:**
- **"Not reviewed yet"** is a `listings` row with no `reviews` row. The job writes the 41 list pages first, so every listing is in the queue before any detail call.
- **"Passed"** is a `reviews` row with `severity_rank = 3` and no `findings` rows.
- **The listing page renders from the stored columns** with no API call. MOD-9 can re-run 4.2 after one edit from the stored rows, without fetching 2,015 listings again.
- **Saving reviews is one short transaction per chunk of listings:**
  1. Upsert the `reviews` rows.
  2. Delete those listings' `findings`.
  3. Insert the new findings.
- **The queue query:**

  ```sql
  from listings l
  left join reviews r on r.listing_uuid = l.uuid
  order by r.severity_rank nulls first, l.position
  limit :size offset (:page - 1) * :size
  ```

  - Postgres puts nulls *last* by default in ascending order, so `nulls first` must be explicit.
  - `position` is unique, so the order is complete and the same query always gives the same page.
  - A rule filter, if we add one, is `exists (select 1 from findings f where f.listing_uuid = l.uuid and f.rule = :rule)`.
- **Pagination uses page numbers (offset), not cursors.**
  - The criteria require "The page number and page size are in the URL", and `QueuePage.total` gives "page N of M".
  - An offset of 2,000 is negligible at this size.
  - Pages shifting while the job writes is handled in MOD-3.

**Locked: the full listing is normalised, as sketched.**
- `listing_pricing_plans` is a child table.
- `ratingDistribution` is not stored, because no rule or screen reads it. Listings rebuilt from rows carry `null` for it.
- The cost is mapper code that turns `AppListing` into rows and back.

**Rejected alternatives:**
- **No schema change, with a JSON file as the store.** It goes against the README ("anything the job writes for the page goes through the database"). Every page load would parse all 2,015 reviews, and a webhook update would rewrite the whole file, with races.
- **One combined table, with the review columns empty until reviewed.** It mixes fetched data with derived data, which makes MOD-9 harder.
- **`issues jsonb` on `reviews`, `summary jsonb` on `listings`, or a `listing_raw jsonb` snapshot.** Replaced by the `findings` table and real columns. Decided: no `jsonb` unless absolutely necessary.
- **Cursor pagination.** It conflicts with page numbers in the URL, and it doesn't help at this size.

### MOD-3 Implement the store (`src/lib/moderation/store.ts`)

- **Done when:**
  - A new `saveListings(summaries | listings)` upserts into `listings`.
  - `saveReviews` upserts into `reviews`.
  - `getReview(uuid)` joins the two tables. It returns `null` for an unknown uuid, and the listing with no review when the job has not reached it.
  - `getQueuePage` runs the left-join query from MOD-2. It returns `rows`, `total`, `page`, `size`, and `reviewedAt` and `ruleRevision` from the latest finished `review_runs` row.
- **Constraints:**
  - PGlite runs one statement at a time, and an open transaction blocks page reads. Write in chunks (say, a few hundred rows per statement) rather than in one long transaction.
  - Use `count(*)::int`, as the comment in `store.ts` says.
- **A run that fails halfway** leaves the rows written so far, which is the simplest behaviour. Listings it didn't reach show as "Not reviewed yet" or keep their previous review. There is no table swap per run.

### MOD-4 Write the review job (`src/lib/moderation/review-job.ts`, `npm run review`)

- **Done when:**
  - `npm run review` inserts a `review_runs` row.
  - It saves the summaries from the 41 list calls into `listings` first, so the queue shows every listing as "Not reviewed yet" straight away.
  - It then fetches each detail into the detail columns and `listing_pricing_plans`, runs `reviewListings` over the full set and saves into `reviews` and `findings`.
  - It sets `finished_at` and `listing_count`.
  - The queue's "last ran" is the latest *finished* run.
- **Locked: throttle deliberately to the live limit**, `LIVE_RATE_LIMIT_PER_MINUTE` (200 calls a minute) from `src/lib/fanvue/api.ts`.
  - Calls are spaced about 300 ms apart, in every environment.
  - A full run takes about 10 minutes (2,056 calls), against the mock too. That is the price of behaving like production.
  - The job saves as it goes, so the queue fills in during the run. That is why the list pass comes first.
  - Throttled, concurrency is pointless, so calls are made one at a time.
- **Trigger:** by hand with `npm run review`, as the backfill and a safety net. Day-to-day freshness comes from events (MOD-9).
- **Edge case not handled:** listings that disappear from the API between runs.

### MOD-5 Queue page reads from the store (`app/page.tsx`, `ReviewQueue.tsx`)

- **Acceptance:**
  - No API calls.
  - The most serious come first across all pages.
  - `?page=` and `?size=` are in the URL.
  - It shows when the job last ran and under which revision.
  - "Not reviewed yet" is shown differently from "No findings".
  - The total comes from the store, not from `rows.length`.
- **Locked:**
  - **Page size:** 50 by default. `?page=` defaults to 1. A `size` out of range is an edge case and not handled.
  - **Status column:** the worst severity (`reject` / `fix` / `warn`), "No findings", or "Not reviewed yet" (the TODO in `ReviewQueue.tsx`).
  - **No severity or rule filters.** The acceptance criteria don't require them.
  - **Remove** the footer that counts API calls.

### MOD-6 Listing page reads one stored review (`app/listings/[uuid]/page.tsx`)

- **Acceptance:** no API calls, and it reads `getReview(uuid)`.
- **Locked:**
  - An unknown uuid gives a 404.
  - A known listing with no review renders whatever columns are stored and says "Not reviewed yet". It never fetches.
  - The page renders from the stored columns (MOD-2).

### MOD-7 Findings show the rule and the text that triggered it

- **Why:** the acceptance criterion "Each finding shows which rule fired and the text that triggered it". Also 1.6: "A reviewer should be able to see what was matched."
- **Done when:**
  - `Issue` gets an optional `matched` / `evidence` field, which the comment in `rules.ts` invites.
  - `FindingsList` shows severity, rule (linked to the doc anchor), field and matched text.
  - The 2.3 example puts its URLs in that field.
- **Storage:** `findings.field` and `findings.evidence` (MOD-2), and `related_listing_uuid` for 4.2. `Issue` gains matching optional `evidence` and `relatedListingUuid`.

### MOD-8 Add one rule (TDD: `rules.test.ts` first, then `rules.ts`)

- **Done when:** `npm run test:spec` passes for that rule's cases, and `npm run see-all-rule-counts` matches its expected generated count.
- **Open (the one decision left): which rule, and its severity.** Settle it when we reach this ticket. Notes for choosing:

| Rule                      | What makes it worth it                                                       | What the doc leaves open (needs a decision)                                                                                                                                      | Spec cases                                                         |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 6.2 Valid, owned URL      | Where the app runs: phishing and brand risk. Clear and well specified.        | How to parse "has no host" and IP literals (IPv6?). Bare `fanvue.com` versus "another domain with our name inside it is fine".                                                  | LinkPulse, Fan Radar                                               |
| 1.6 Other platforms       | Commercial risk to Fanvue. The hardest to get right.                          | Telling "Only Fans" the name from "the only fans who tip" (the doc: "We would rather miss a disguised name than reject a legitimate listing"). Digit-swap mapping. Which fields count. | Audience Boost, Superfan Rewards (must *not* fire)                 |
| 3.3 Pricing accuracy      | Creators are charged money. Trust.                                            | Do `withdrawn` / `pending_setup` plans count? Is a free plan 0 or billingType `free`? Non-USD plans are a finding, but at what severity?                                       | Caption Forge, Studio Ledger, Studio Euro                          |
| 4.2 Originality           | Catches template resubmissions. Compares across the store.                    | The similarity measure and threshold ("a judgement call. Reviewers should be able to say what they chose and why"). About 2 million pairs.                                       | Creator Copilot, Copilot for Creators, Ledger Lite/Pro (must *not* fire) |
| 2.1 Production ready      | The easiest. A word list is given.                                            | Whole word or substring (does `TBD` match inside a word?). Which fields count.                                                                                                  | LinkPulse                                                          |

- **Baseline from `npm run see-all-rule-counts`** (2.3 only):

  | Rule | Named | Generated | Expected (generated) |
  | ---- | ----- | --------- | -------------------- |
  | 1.6  | 0     | 0         | 65                   |
  | 2.1  | 0     | 0         | 47                   |
  | 2.3  | 2     | 118       | 118 ✓                |
  | 3.3  | 0     | 0         | 55                   |
  | 6.2  | 0     | 0         | 198                  |
  | 4.2  | –     | –         | no expected count    |

  Today: 120 listings have a `fix`, none have a `reject` or `warn`, and 1,895 of 2,015 have no findings. The queue's sort has almost nothing to sort until a second rule lands.

- **Severity guidance from the docs:**
  - `rules.ts`: "`reject`: the listing cannot go live as it is. `fix`: the developer can correct it without anyone's judgement. `warn`: a person should look."
  - 4.5: one small problem is accept-with-fixes, and repeated problems are a rejection.

### MOD-9 Event-driven re-review (webhook). Part of the architecture; build it if time allows

- **Why:** "Editing a listing or a pricing plan starts a new submission, and a webhook reports it." Also: "one edit can change another listing's findings" (4.2).
- **Sketch:**
  1. The webhook fetches one listing (1 call) and upserts its row in `listings`.
  2. It re-runs `reviewListings` over every stored listing, rebuilt from its columns.
  3. It saves only the `reviews` rows that changed, which may include other listings through 4.2.
- **Where it lives:**
  - The mock API sends no webhooks, so we add the receiving route under `app/api/moderation/` (the candidate may change that directory). For example, `POST /api/moderation/events/submission` with `{ uuid }`.
  - We need a way to fire an event by hand to demonstrate it: `curl`, or an `npm run` script.
- **Decided:** any listing whose worst severity changed, edited or knocked on through 4.2, moves to the end of submission order. The store's save applies this (MOD-2).
- **Simplest version:**
  - The work runs inside the webhook request.
  - Events don't coordinate with a running backfill. Bursts, and sharing the rate limit, are edge cases and not handled.

### Out of scope: moderator decisions

README "The task" 3 is optional, and it is dropped from this plan. `decisions.ts` and `app/api/moderation/decisions/route.ts` stay as they are.

---

## Suggested order

1. MOD-1
2. MOD-2
3. MOD-3
4. MOD-4
5. MOD-5
6. MOD-6
7. MOD-7
8. MOD-8
9. Then MOD-9 if time allows.

The core is MOD-1 to MOD-6. The README calls the speed work "the core of the task". MOD-7 is cheap once the store exists.

**Alternative:** do MOD-8 (the rule) before MOD-5 and MOD-6, so the queue has more than one rule's findings to sort when we build it. The repo's history ("Put making the pages fast before writing rules", #44) argues for speed first.
