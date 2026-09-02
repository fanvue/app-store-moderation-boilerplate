# App Store moderation boilerplate

A starting point for building a moderation tool for Fanvue App Store listings. It ships a Next.js 15 app with the Fanvue design system (`@fanvue/ui`), fifteen synthetic listings behind a mock of the public Fanvue `/v0/apps` API, a review queue UI, an empty rule engine (`validateListing`) and a test harness. Your task is described in [`TASK.md`](TASK.md): implement deterministic rule checks against the public [App Store Listing Requirements](https://api.fanvue.com/docs/app-store/listing-requirements) and surface the findings in the review queue.

This repo needs no Fanvue account or credentials.

## Prerequisites

- Node.js 24 (`.nvmrc` is set; `nvm use` or `fnm use`)
- pnpm via corepack: `corepack enable` (the version is pinned in `package.json`). If `corepack` is not found or `corepack enable` errors, run `npm i -g pnpm@10` and continue.
- Windows works natively. WSL is optional; if you use it, clone inside `~/`, not `/mnt/c`.

## Quick start

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
- On Node 22 the `engines` requirement prints a warning but everything still runs. Node 24 is what CI uses.
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
2. The rules themselves: https://api.fanvue.com/docs/app-store/listing-requirements
3. The data shape: `src/lib/fanvue/types.ts` (`AppListing`, hand-derived from the public OpenAPI spec) and `docs/openapi.apps.json` (the relevant excerpt of that spec).
4. Tests: `src/lib/moderation/rules.test.ts` has one passing smoke test and three `it.todo` placeholders. Unit tests cover `src/lib`; the UI is not unit tested here.
5. Offline copies of the two public docs you need are in `docs/listing-requirements.md` and `docs/pricing-plans.md` (the live pages win if they differ).
6. The component library, `@fanvue/ui`: source at https://github.com/fanvue/fanv-ui, Storybook at https://main--697a1b6dd4dad73ee9c0e5f5.chromatic.com/. Offline, `node_modules/@fanvue/ui/dist/index.d.ts` is the source of truth for component props.

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

## Assumptions

The requirements doc is mostly prose and contains very few numbers. Anything you check that goes beyond its literal text (a word list for "placeholder content", a price range, a URL pattern) is an assumption. Record each one in [`ASSUMPTIONS.md`](ASSUMPTIONS.md) and report it as `warn` rather than `reject`, unless the doc is explicit about it.

## Mock API

The app reads its data through `src/lib/fanvue/api.ts` (`listApps`, `getApp`, `getAllApps`), pure functions over `fixtures/listings.ts`. The same functions are exposed over HTTP under `/api/v0` with the paths, query parameters and response shapes of the live Fanvue API, so what you read in the public docs at https://api.fanvue.com/docs applies here. Differences from the real thing: no bearer token is needed and the `X-Fanvue-API-Version` header is ignored.

| Endpoint                  | Mirrors                  | Notes                                                                                                      |
| ------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `GET /api/v0/apps`        | `GET /v0/apps`           | `{ data, pagination: { page, size, hasMore } }`; `page` (default 1), `size` (default 15, max 50), `search` |
| `GET /api/v0/apps/{uuid}` | `GET /v0/apps/{appUuid}` | Full listing; `400 { message }` for a malformed uuid; `404 { message }` for an unknown one                 |

```bash
curl -s 'http://localhost:3000/api/v0/apps?size=5' | jq '.pagination, (.data | map(.name))'
curl -s 'http://localhost:3000/api/v0/apps?search=analytics' | jq '.data[].name'
curl -s 'http://localhost:3000/api/v0/apps?size=99'            # 400 { "errors": [...] }
curl -s 'http://localhost:3000/api/v0/apps/<uuid>' | jq
curl -s 'http://localhost:3000/api/v0/apps/not-a-uuid'         # 400 { "message": "Invalid UUID format" }
```

Notes on the spec and our interpretation of it:

- `search` is described as "matched against the app's listing metadata". Here that means a case-insensitive substring match over `name`, `tagline`, `description` and `developer.name`.
- `pagination.size` is the number of records returned on the current page, not the requested page size.
- The list endpoint returns summaries only (`uuid`, `name`, `tagline`, `description`, `logoUrl`, `appUrl`, `pricingType`, `rating`, `developer`). Most fields the rules need are only on the detail endpoint, so a real review queue would fetch each app's detail or precompute findings in a server-side job. The review queue page does the former.
- The public spec declares `pricingPlans[].interval` as `type: ["string", "null"], enum: ["monthly", "yearly"]`, which strictly read rejects `null`. Our `AppListing` type allows `null` because free and one-time plans have no interval.

Fixtures are typed as `AppListing[]`, so `pnpm typecheck` is the schema check: a misspelt field or an invalid enum value fails the build.

## Project map

```
app/
  layout.tsx                  Root layout and header
  page.tsx                    Review queue (/)
  listings/[uuid]/page.tsx    Listing detail (/listings/:uuid)
  api/v0/apps/route.ts        Mock GET /v0/apps
  api/v0/apps/[uuid]/route.ts Mock GET /v0/apps/{appUuid}
src/
  components/
    ReviewQueue.tsx           Table of listings with a Findings column
    ListingDetail.tsx         Every listing field plus a Findings panel
    FindingsList.tsx          Renders Issue[] with severity badges
    Header.tsx
  lib/
    fanvue/types.ts           AppListing and friends, derived from the public OpenAPI spec
    fanvue/api.ts             listApps / getApp / getAllApps over the fixtures
    fanvue/api.test.ts
    moderation/rules.ts       validateListing: implement this
    moderation/rules.test.ts
fixtures/listings.ts          15 synthetic listings
docs/openapi.apps.json        OpenAPI excerpt: GET /apps and GET /apps/{appUuid}
ASSUMPTIONS.md                Record your assumptions here
.github/workflows/ci.yml      typecheck, lint, test, build on push to main
```

## Stack

Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, [`@fanvue/ui`](https://github.com/fanvue/fanv-ui) ([Storybook](https://main--697a1b6dd4dad73ee9c0e5f5.chromatic.com/)), Vitest, ESLint.

## License

MIT, see [`LICENSE`](LICENSE).
