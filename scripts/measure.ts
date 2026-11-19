/**
 * Measures the moderation tool from the outside: how long the pages take, how
 * many API calls they make, and how quickly and how cheaply an edit to a
 * listing reaches what is stored. Needs `npm run dev` running.
 *
 *   npm run measure
 *
 * It edits listings in the mock API, sends the events and watches the store
 * through `getReview` and `getQueuePage` in `src/lib/moderation/store.ts`.
 * Every edit is put back before it finishes.
 */
import { sql } from "kysely";

import { getDb } from "@/lib/db/client";
import { LIVE_RATE_LIMIT_PER_MINUTE } from "@/lib/fanvue/api";
import type { ListingEvent } from "@/lib/fanvue/events";
import { currentListings, totalCallCount } from "@/lib/fanvue/mock-state";
import { deliverEvents, editListing, restoreListing } from "@/lib/fanvue/simulator";
import type { AppListing } from "@/lib/fanvue/types";
import { SEVERITY_ORDER } from "@/lib/moderation/queue";
import { reviewListings } from "@/lib/moderation/rules";
import { getQueuePage, getReview } from "@/lib/moderation/store";

const BASE_URL = process.env.MODERATION_URL ?? "http://localhost:3000";
const QUEUE_PATH = "/?page=1&size=50";
const BURST_SIZE = 100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const count = (value: number) => Math.round(value).toLocaleString("en-US");
const apiCalls = (calls: number) => `${count(calls)} API ${calls === 1 ? "call" : "calls"}`;
const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

function heading(title: string): void {
  console.log(`\n${title}`);
}

function line(label: string, ...values: string[]): void {
  console.log(`  ${label.padEnd(36)}${values.filter(Boolean).join("   ")}`);
}

/** How long a number of API calls takes at the live rate limit. */
function atLiveLimit(calls: number): string {
  const minutes = calls / LIVE_RATE_LIMIT_PER_MINUTE;
  if (minutes < 1) return "under a minute at the live rate limit";
  if (minutes < 120) return `${count(minutes)} minutes at the live rate limit`;
  return `${count(minutes / 60)} hours at the live rate limit`;
}

/** Waits until nothing has called the API for half a second, so the next count starts clean. */
async function waitForQuiet(maxMs = 15_000): Promise<void> {
  const deadline = Date.now() + maxMs;
  let last = totalCallCount();
  let quietSince = Date.now();
  while (Date.now() < deadline && Date.now() - quietSince < 500) {
    await sleep(100);
    const now = totalCallCount();
    if (now !== last) {
      last = now;
      quietSince = Date.now();
    }
  }
}

async function timedGet(path: string): Promise<{ ms: number; status: number | null; problem: string | null }> {
  const started = performance.now();
  try {
    const response = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(180_000) });
    await response.text();
    return { ms: performance.now() - started, status: response.status, problem: null };
  } catch (error) {
    return { ms: performance.now() - started, status: null, problem: messageOf(error) };
  }
}

/** One page's time and API calls. A fast page is loaded three times and the best time kept. */
async function measurePage(label: string, path: string): Promise<void> {
  await waitForQuiet();
  const callsBefore = totalCallCount();
  let result = await timedGet(path);
  const calls = totalCallCount() - callsBefore;

  for (let repeat = 0; repeat < 2 && result.ms < 5000 && result.status === 200; repeat += 1) {
    const again = await timedGet(path);
    if (again.status === 200 && again.ms < result.ms) result = again;
  }

  if (result.status === null) return line(label, `no answer: ${result.problem}`);
  line(
    label,
    `${count(result.ms).padStart(7)} ms`,
    apiCalls(calls).padStart(16),
    result.status === 200 ? "" : `(answered ${result.status})`,
  );
}

/** The rules each listing breaks right now, straight from the mock API's data. What the store should hold. */
function expectedFindings(): Map<string, string> {
  return new Map(reviewListings(currentListings()).map((review) => [review.listing.uuid, findingsKey(review.issues)]));
}

const findingsKey = (issues: { rule: string; code: string }[]) =>
  issues
    .map((issue) => `${issue.rule} ${issue.code}`)
    .sort()
    .join(", ");

async function storedFindings(uuid: string): Promise<string | null> {
  const review = await getReview(uuid);
  return review ? findingsKey(review.issues) : null;
}

/**
 * Polls the store until every listing in `uuids` holds the findings in
 * `expected`. Returns how long that took from `startedAt`, or the listings
 * still wrong when time ran out.
 */
async function waitForStore(
  uuids: string[],
  expected: Map<string, string>,
  startedAt: number,
  { timeoutMs = 20_000, everyMs = 50 } = {},
): Promise<{ ms: number } | { wrong: string[] }> {
  let wrong = uuids;
  while (performance.now() - startedAt < timeoutMs) {
    const stillWrong: string[] = [];
    for (const uuid of wrong) {
      if ((await storedFindings(uuid)) !== expected.get(uuid)) stillWrong.push(uuid);
    }
    wrong = stillWrong;
    if (wrong.length === 0) return { ms: performance.now() - startedAt };
    await sleep(everyMs);
  }
  return { wrong };
}

/** Loads the queue page again and again until stopped, and reports the slowest load. */
function watchQueuePage(): { stop: () => Promise<number> } {
  let running = true;
  let slowest = 0;
  const loop = (async () => {
    while (running) {
      const { ms } = await timedGet(QUEUE_PATH);
      slowest = Math.max(slowest, ms);
      await sleep(100);
    }
  })();
  return {
    stop: async () => {
      running = false;
      await loop;
      return slowest;
    },
  };
}

async function measureStoredQueue(total: number): Promise<void> {
  heading("The stored queue");
  try {
    const size = 50;
    const first = await getQueuePage(1, size);
    const rows = [...first.rows];
    const pages = Math.min(Math.ceil(first.total / size), 200);
    for (let page = 2; page <= pages; page += 1) rows.push(...(await getQueuePage(page, size)).rows);

    const distinct = new Set(rows.map((row) => row.uuid)).size;
    line("listings in the queue", `${count(first.total)} of ${count(total)}`);
    if (distinct !== first.total) {
      line("rows across all pages", `${count(distinct)} different listings, but total says ${count(first.total)}`);
    }

    const rank = (severity: string | null) =>
      severity === null ? SEVERITY_ORDER.length : SEVERITY_ORDER.indexOf(severity as never);
    const outOfPlace = rows.findIndex(
      (row, index) => index > 0 && rank(row.severity) < rank(rows[index - 1]!.severity),
    );
    line(
      "most serious first, on every page",
      rows.length === 0
        ? "nothing to check"
        : outOfPlace === -1
          ? "yes"
          : `no, first out of place on page ${Math.floor(outOfPlace / size) + 1}`,
    );
  } catch (error) {
    line("not measured", messageOf(error));
  }
}

/** Says so when no worker has finished a step in the last five seconds. */
async function checkWorker(): Promise<void> {
  const beat = await sql<{
    age: number;
  }>`select extract(epoch from now() - beat_at)::float as age from worker_heartbeat`
    .execute(getDb())
    .then((result) => result.rows[0]?.age ?? null)
    .catch(() => null);
  if (beat === null || beat > 5) {
    console.log("\nNo worker has run in the last 5 seconds. `npm run dev` starts one.");
  }
}

async function measureEdits(): Promise<void> {
  heading("Edits");

  // Listings with no findings, so each edit below changes what the rules say.
  const before = expectedFindings();
  const clean = currentListings()
    .slice(15)
    .filter((listing) => before.get(listing.uuid) === "" && listing.appUrl?.startsWith("https://"));
  const edited = clean[0];
  const copied = clean.find((listing) => listing.developer.handle !== edited?.developer.handle);
  const burst = clean.filter((listing) => listing !== edited && listing !== copied).slice(0, BURST_SIZE);
  if (!edited || !copied || burst.length < BURST_SIZE) {
    return line("not measured", "too few unedited listings left. `npm run db:reset` starts again.");
  }

  const plainHttp = (listing: AppListing) => ({ appUrl: listing.appUrl!.replace("https://", "http://") });
  const touched = new Set<string>();
  const edit = (listing: AppListing, change: Partial<AppListing>): ListingEvent => {
    touched.add(listing.uuid);
    return editListing(listing.uuid, change);
  };

  try {
    // One edit, delivered twice.
    await waitForQuiet();
    let callsBefore = totalCallCount();
    const event = edit(edited, plainHttp(edited));
    let expected = expectedFindings();
    let startedAt = performance.now();
    const delivery = await deliverEvents([event], { duplicateEvery: 1 });
    if (delivery.failed > 0)
      return line("not measured", `${delivery.firstFailure} (app/api/moderation/events/route.ts)`);

    let outcome = await waitForStore([edited.uuid], expected, startedAt);
    await waitForQuiet();
    line(
      "one listing edited",
      "ms" in outcome ? `stored after ${count(outcome.ms)} ms` : "not stored after 20 s",
      `${apiCalls(totalCallCount() - callsBefore)} (1 is enough)`,
    );
    if ("wrong" in outcome) return;

    // 4.2: the edit copies another developer's description, then takes it back.
    const copy = edit(edited, {
      appUrl: edited.appUrl,
      description: copied.description,
      descriptionBody: copied.descriptionBody.replaceAll(copied.name, edited.name),
    });
    expected = expectedFindings();
    startedAt = performance.now();
    await deliverEvents([copy], { duplicateEvery: 0 });
    outcome = await waitForStore([edited.uuid, copied.uuid], expected, startedAt);
    const flagged =
      "ms" in outcome
        ? `both flagged after ${count(outcome.ms)} ms`
        : `${outcome.wrong.includes(copied.uuid) ? "the listing it copied" : "the edited listing"} not flagged after 20 s`;

    const undo = restoreListing(edited.uuid);
    expected = expectedFindings();
    startedAt = performance.now();
    await deliverEvents([undo], { duplicateEvery: 0 });
    outcome = await waitForStore([edited.uuid, copied.uuid], expected, startedAt);
    const cleared =
      "ms" in outcome
        ? `both cleared after ${count(outcome.ms)} ms`
        : `${outcome.wrong.includes(copied.uuid) ? "the listing it copied" : "the edited listing"} still flagged after 20 s`;
    line("a description copied, then undone", flagged, cleared);

    // Many edits at once, some listings edited twice, while a moderator loads the queue.
    await waitForQuiet();
    callsBefore = totalCallCount();
    const events = burst.flatMap((listing, index) => {
      const first = edit(listing, plainHttp(listing));
      return index % 5 === 0
        ? [first, edit(listing, { tagline: `${listing.tagline}, now with weekly summaries` })]
        : [first];
    });
    expected = expectedFindings();
    const queuePage = watchQueuePage();
    startedAt = performance.now();
    const burstDelivery = await deliverEvents(events);
    outcome = await waitForStore(
      burst.map((listing) => listing.uuid),
      expected,
      startedAt,
      { timeoutMs: 60_000, everyMs: 500 },
    );
    const slowestPage = await queuePage.stop();
    await waitForQuiet();
    const calls = totalCallCount() - callsBefore;

    line(
      `${BURST_SIZE} listings edited at once`,
      "ms" in outcome ? `all stored after ${count(outcome.ms)} ms` : `${outcome.wrong.length} not stored after 60 s`,
      `${apiCalls(calls)} (${BURST_SIZE} is enough), ${atLiveLimit(calls)}`,
    );
    line("  slowest queue page meanwhile", `${count(slowestPage)} ms`);
    line(
      "  slowest webhook answer",
      `${count(burstDelivery.slowestMs)} ms`,
      burstDelivery.failed > 0 ? `${burstDelivery.failed} events not accepted` : "",
    );
  } finally {
    // Put every edit back, and tell the tool, so a second run starts from the same place.
    const undone = [...touched].map((uuid) => restoreListing(uuid));
    touched.clear();
    if (undone.length > 0) {
      const expected = expectedFindings();
      const startedAt = performance.now();
      const delivery = await deliverEvents(undone);
      if (delivery.failed === 0) {
        await waitForStore(
          undone.map((event) => event.listingUuid),
          expected,
          startedAt,
          { timeoutMs: 60_000, everyMs: 500 },
        ).catch(() => {});
      }
    }
  }

  // Last: is every stored review what the rules say now?
  await waitForQuiet();
  const expected = expectedFindings();
  const listings = currentListings();
  const wrong: string[] = [];
  for (const listing of listings) {
    const stored = await storedFindings(listing.uuid);
    if (stored !== expected.get(listing.uuid)) {
      wrong.push(
        `${listing.name}: stored ${stored === null ? "nothing" : `[${stored}]`}, the rules say [${expected.get(listing.uuid)}]`,
      );
    }
  }
  line("stored findings match the rules", `${count(listings.length - wrong.length)} of ${count(listings.length)}`);
  for (const example of wrong.slice(0, 3)) console.log(`    ${example}`);
}

async function main(): Promise<void> {
  const up = await timedGet("/api/v0/apps?size=1");
  if (up.status !== 200) {
    console.error(`${BASE_URL} is not answering. Start \`npm run dev\` first.`);
    process.exitCode = 1;
    return;
  }

  const listings = currentListings();
  const started = performance.now();
  reviewListings(listings);
  console.log(
    `${count(listings.length)} listings. Running the rules over all of them in memory takes ${count(performance.now() - started)} ms.`,
  );
  await checkWorker();

  heading("Pages");
  await measurePage(`queue page ${QUEUE_PATH}`, QUEUE_PATH);
  await measurePage("listing page", `/listings/${listings[0]!.uuid}`);

  await measureStoredQueue(listings.length);

  try {
    await measureEdits();
  } catch (error) {
    line("not measured", messageOf(error));
  }
}

main()
  .catch((error) => {
    console.error(messageOf(error));
    process.exitCode = 1;
  })
  .finally(() => getDb().destroy());
