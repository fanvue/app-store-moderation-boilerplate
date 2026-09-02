# App Store moderation boilerplate

> **Interview candidates: read [`TASK.md`](TASK.md) first.** It is the full brief: what to build, how the hour runs, and how to share your work.

A starting point for a moderation tool for Fanvue App Store listings: Next.js 15 with the Fanvue design system (`@fanvue/ui`), fifteen synthetic listings behind a mock of the public Fanvue `/v0/apps` API, a review queue UI, an empty rule engine (`validateListing`) and a test harness. The task is in [`TASK.md`](TASK.md). No Fanvue account or credentials are needed.

## Quick start

Prerequisites:

- Node.js 24: `nvm install 24` or `fnm install 24` (`.nvmrc` is set). Node 22 prints an engine warning but works.
- pnpm via corepack: `corepack enable`. If `corepack` is not found or errors, run `npm i -g pnpm@10` instead.
- Windows works natively. WSL is optional; if you use it, clone inside `~/`, not `/mnt/c`.

```bash
git clone https://github.com/fanvue/app-store-moderation-boilerplate.git
cd app-store-moderation-boilerplate
pnpm install
pnpm dev
```

Open http://localhost:3000. The first page compile takes 10 to 20 s in dev. Every listing shows "Not checked" until you implement rules.

Notes:

- The first `pnpm` command may ask once `Corepack is about to download pnpm ... continue?`. Answer `y`.
- Images are external placeholders (placehold.co), so they render as broken images when you are offline. Nothing else needs the network.
- Running `npm` or `npx` inside the repo prints `Unknown project config "auto-install-peers"`. That is a pnpm-only setting in `.npmrc`; the warning is harmless.

## Scripts

| Command           | What it does                        |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Start the dev server on port 3000   |
| `pnpm build`      | Production build                    |
| `pnpm start`      | Serve the production build          |
| `pnpm test`       | Run all tests once (Vitest)         |
| `pnpm test:watch` | Run tests in watch mode             |
| `pnpm typecheck`  | `tsc --noEmit`                      |
| `pnpm lint`       | ESLint (Next.js + TypeScript rules) |

## Where to start

1. `src/lib/moderation/rules.ts`: `validateListing(listing)` returns `Issue[]` and is currently empty. Each `Issue` carries a stable `code`, the `rule` number from the requirements doc (e.g. `"2.3"`), a `severity` and a `message`.
2. `docs/listing-requirements.md`: the rules. Start with the "Common rejection reasons" table at the bottom. `docs/pricing-plans.md` has the price range. Both are snapshots of the public pages; the live page wins if they differ.
3. `src/lib/fanvue/types.ts`: the listing shape (`AppListing`), with field comments.
4. `src/lib/moderation/rules.test.ts`: one passing smoke test and three `it.todo` placeholders. Unit tests cover `src/lib`; the UI is not unit tested here.

The UI is already wired: the review queue (`/`) and the listing page (`/listings/[uuid]`) both call `validateListing` and render the result through `src/components/FindingsList.tsx`.

## Field glossary

The listing has three image fields and the requirements doc talks about "screenshots". The public publishing doc defines preview images as the screenshots or visuals shown on the listing page, so:

| Field              | Meaning                                                        |
| ------------------ | -------------------------------------------------------------- |
| `previewImageUrls` | The listing's screenshots. This is what rule 2.3 counts.       |
| `galleryImageUrls` | Thumbnails shown beside the hero; not counted as screenshots.  |
| `heroImageUrl`     | Banner at the top of the listing (branding, not a screenshot). |
| `logoUrl`          | The app icon.                                                  |

Prices in `pricingPlans[].price` are minor currency units (cents for USD).

## Mock API

The UI reads its data through `src/lib/fanvue/api.ts` (`listApps`, `getApp`, `getAllApps`), pure functions over `fixtures/listings.ts`. The same functions are served under `/api/v0/apps` and `/api/v0/apps/{uuid}` with the paths, query parameters and response shapes of the live Fanvue API (no auth locally). The task does not need any of this; the comments in `api.ts` and the route handlers carry the details.

## Project map

```
app/page.tsx                      Review queue (/)
app/listings/[uuid]/page.tsx      Listing detail (/listings/:uuid)
app/api/v0/apps/                  Mock GET /v0/apps and /v0/apps/{appUuid}
src/components/                   ReviewQueue, ListingDetail, FindingsList, Header
src/lib/fanvue/types.ts           AppListing and friends, derived from the public OpenAPI spec
src/lib/fanvue/api.ts             listApps / getApp / getAllApps over the fixtures
src/lib/moderation/rules.ts       validateListing: implement this
src/lib/moderation/rules.test.ts  Tests for validateListing
fixtures/listings.ts              15 synthetic listings, typed as AppListing[] (pnpm typecheck is the schema check)
docs/                             Vendored requirements and pricing docs, plus the OpenAPI excerpt
ASSUMPTIONS.md                    Record your assumptions here
```

## Stack

Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, [`@fanvue/ui`](https://github.com/fanvue/fanv-ui) ([Storybook](https://main--697a1b6dd4dad73ee9c0e5f5.chromatic.com/); offline, `node_modules/@fanvue/ui/dist/index.d.ts` is the source of truth for component props), Vitest, ESLint.

## License

MIT, see [`LICENSE`](LICENSE).
