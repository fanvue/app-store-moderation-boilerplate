/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is plumbing behind one of the npm commands.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

/**
 * Measures the moderation tool from the outside: how long the pages take, how
 * many API calls they make, and how quickly and how cheaply an edit to a
 * listing reaches what is stored. Needs `npm run dev` running.
 *
 *   npm run measure
 *
 * It edits listings in the mock API, sends the events and watches the store
 * through `getReview` and `getQueuePage` in `src/lib/moderation/store.ts`.
 * Every edit is put back before it finishes, also when you stop it with Ctrl-C.
 */
import { getDb } from "@/lib/db/client";
import { LIVE_RATE_LIMIT_PER_MINUTE } from "@/lib/fanvue/api";
import type { ListingEvent } from "@/lib/fanvue/events";
import { currentListings, totalCallCount } from "@/lib/fanvue/mock-state";
import { deliverEvents, editListing, restoreListing } from "@/lib/fanvue/simulator";
import type { AppListing } from "@/lib/fanvue/types";
import { SEVERITY_ORDER, worstSeverity } from "@/lib/moderation/queue";
import { reviewListings, type Severity } from "@/lib/moderation/rules";
import { getQueuePage, getReview, type QueueRow } from "@/lib/moderation/store";

const BASE_URL = process.env.MODERATION_URL ?? "http://localhost:3000";
const QUEUE_PATH = "/?page=1&size=50";
const QUEUE_PAGE_SIZE = 50;
const BURST_SIZE = 100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const count = (value: number) => Math.round(value).toLocaleString("en-US");
const apiCalls = (calls: number) => `${count(calls)} API ${calls === 1 ? "call" : "calls"}`;
const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Set by Ctrl-C. Nothing more is edited or printed after it. */
let stopping = false;

function heading(title: string): void {
  if (!stopping) console.log(`\n${title}`);
}

function line(label: string, ...values: string[]): void {
  if (stopping) return;
  console.log(`  ${label.padEnd(36)}${values.filter(Boolean).join("   ")}`);
}

/** How long a number of API calls takes at the live rate limit. */
function atLiveLimit(calls: number): string {
  const minutes = calls / LIVE_RATE_LIMIT_PER_MINUTE;
  if (minutes < 1) return "under a minute at the live rate limit";
  if (minutes < 120) return `${count(minutes)} minutes at the live rate limit`;
  return `${count(minutes / 60)} hours at the live rate limit`;
}

let everQuiet = true;

/**
 * Waits until nothing has called the API for half a second, so the next count
 * starts clean. Returns `false` if the API was still being called when the
 * wait ran out. Every process shares one call count, so a count taken then
 * includes calls that are not from the thing being measured.
 */
async function waitForQuiet(): Promise<boolean> {
  // Once the API has failed to go quiet, a long wait is unlikely to help the next time.
  const deadline = Date.now() + (everQuiet ? 15_000 : 3000);
  let last = totalCallCount();
  let quietSince = Date.now();
  while (Date.now() - quietSince < 500) {
    if (Date.now() >= deadline) {
      everQuiet = false;
      return false;
    }
    await sleep(100);
    const now = totalCallCount();
    if (now !== last) {
      last = now;
      quietSince = Date.now();
    }
  }
  return true;
}

/** Goes next to a call count taken while something else was calling the API. */
const notQuiet = (quiet: boolean) => (quiet ? "" : "(something else kept calling the API, so this count includes it)");

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

/**
 * One page's time and API calls. A fast page is loaded three times and the best time kept.
 * Returns the API calls one load made, or `null` when that is not known.
 */
async function measurePage(label: string, path: string): Promise<number | null> {
  const quiet = await waitForQuiet();
  const callsBefore = totalCallCount();
  let result = await timedGet(path);
  const calls = totalCallCount() - callsBefore;

  for (let repeat = 0; repeat < 2 && result.ms < 5000 && result.status === 200; repeat += 1) {
    const again = await timedGet(path);
    if (again.status === 200 && again.ms < result.ms) result = again;
  }

  if (result.status === null) {
    line(label, `no answer: ${result.problem}`);
    return null;
  }
  line(
    label,
    `${count(result.ms).padStart(7)} ms`,
    apiCalls(calls).padStart(16),
    result.status === 200 ? "" : `(answered ${result.status})`,
    notQuiet(quiet),
  );
  // A count that includes other work does not say what the page itself does.
  return quiet ? calls : null;
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

type QueuePageWatch = { slowestMs: number; loads: number; failed: number; firstFailure: string | null };

/** Loads the queue page again and again until stopped. Reports the slowest load and the loads that did not answer 200. */
function watchQueuePage(): { stop: () => Promise<QueuePageWatch> } {
  let running = true;
  const watch: QueuePageWatch = { slowestMs: 0, loads: 0, failed: 0, firstFailure: null };
  const loop = (async () => {
    while (running) {
      const { ms, status, problem } = await timedGet(QUEUE_PATH);
      watch.loads += 1;
      watch.slowestMs = Math.max(watch.slowestMs, ms);
      if (status !== 200) {
        watch.failed += 1;
        watch.firstFailure ??= status === null ? `no answer: ${problem}` : `answered ${status}`;
      }
      await sleep(100);
    }
  })();
  return {
    stop: async () => {
      running = false;
      await loop;
      return watch;
    },
  };
}

/** Every row of the stored queue, page by page, in the order the pages give them. */
async function allQueueRows(): Promise<{ rows: QueueRow[]; total: number }> {
  const first = await getQueuePage(1, QUEUE_PAGE_SIZE);
  const rows = [...first.rows];
  const pages = Math.min(Math.ceil(first.total / QUEUE_PAGE_SIZE), 200);
  for (let page = 2; page <= pages; page += 1) rows.push(...(await getQueuePage(page, QUEUE_PAGE_SIZE)).rows);
  return { rows, total: first.total };
}

const severityName = (severity: Severity | null | undefined) =>
  severity === undefined ? "nothing" : (severity ?? "no findings");

/**
 * Compares the severity on each queue row with the most serious finding the
 * rules give that listing now. Returns one sentence per listing that differs.
 */
function queueSeverityProblems(rows: QueueRow[]): string[] {
  const inQueue = new Map(rows.map((row) => [row.uuid, row.severity]));
  return reviewListings(currentListings()).flatMap((review) => {
    const shown = inQueue.get(review.listing.uuid);
    const expected = worstSeverity(review.issues);
    return shown === expected
      ? []
      : [`${review.listing.name}: the queue says ${severityName(shown)}, the rules say ${severityName(expected)}`];
  });
}

/** Polls the queue until one listing's row shows `expected`. Returns what the queue showed last if it never does. */
async function waitForQueueSeverity(
  uuid: string,
  expected: Severity | null,
  timeoutMs = 5000,
): Promise<{ ok: true } | { ok: false; shown: Severity | null | undefined }> {
  const deadline = performance.now() + timeoutMs;
  for (;;) {
    const shown = (await allQueueRows()).rows.find((row) => row.uuid === uuid)?.severity;
    if (shown === expected) return { ok: true };
    if (performance.now() >= deadline) return { ok: false, shown };
    await sleep(250);
  }
}

async function measureStoredQueue(total: number): Promise<void> {
  heading("The stored queue");
  try {
    const { rows, total: inQueue } = await allQueueRows();

    const distinct = new Set(rows.map((row) => row.uuid)).size;
    line("listings in the queue", `${count(inQueue)} of ${count(total)}`);
    if (inQueue < total) console.log("    `npm run send-events` sends an event for every listing.");
    if (distinct !== inQueue) {
      line("rows across all pages", `${count(distinct)} different listings, but total says ${count(inQueue)}`);
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
          : `no, first out of place on page ${Math.floor(outOfPlace / QUEUE_PAGE_SIZE) + 1}`,
    );
    if (rows.length > 0) reportQueueSeverities("severities match the rules", rows, total);
  } catch (error) {
    line("not measured", messageOf(error));
  }
}

/** One line: how many listings have the severity in the queue that the rules give them, and one that does not. */
function reportQueueSeverities(label: string, rows: QueueRow[], total: number): void {
  const problems = queueSeverityProblems(rows);
  line(label, `${count(total - problems.length)} of ${count(total)}`);
  if (problems[0]) console.log(`    ${problems[0]}`);
}

/** Listings this run has edited and not put back yet. */
const touched = new Set<string>();

/**
 * Puts every edit back and tells the tool, so the next run starts from the
 * same place. Then waits up to `waitMs` for the store to follow.
 */
async function putEditsBack(waitMs: number): Promise<void> {
  const undone = [...touched].map((uuid) => restoreListing(uuid));
  touched.clear();
  if (undone.length === 0) return;

  const expected = expectedFindings();
  const startedAt = performance.now();
  const delivery = await deliverEvents(undone);
  if (delivery.failed > 0 || waitMs === 0) return;

  console.log("  putting the edits back");
  await waitForStore(
    undone.map((event) => event.listingUuid),
    expected,
    startedAt,
    { timeoutMs: waitMs, everyMs: 500 },
  ).catch(() => {});
}

// Ctrl-C skips `finally`, so the edits are put back here.
process.once("SIGINT", () => {
  stopping = true;
  console.log("\nStopped. Putting the edits back.");
  putEditsBack(0)
    .catch(() => {})
    .finally(() => process.exit(130));
});

/** `queuePageCalls` is how many API calls one load of the queue page made, or `null` when that is not known. */
async function measureEdits(queuePageCalls: number | null): Promise<void> {
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
  // How long to wait for the store after the edits are put back.
  let putBackWaitMs = 60_000;
  const edit = (listing: AppListing, change: Partial<AppListing>): ListingEvent => {
    if (stopping) throw new Error("stopped");
    touched.add(listing.uuid);
    return editListing(listing.uuid, change);
  };

  try {
    // One edit, delivered twice.
    let quiet = await waitForQuiet();
    let callsBefore = totalCallCount();
    const event = edit(edited, plainHttp(edited));
    let expected = expectedFindings();
    let startedAt = performance.now();
    const delivery = await deliverEvents([event], { duplicateEvery: 1 });
    if (delivery.failed > 0)
      return line("not measured", `${delivery.firstFailure} (app/api/moderation/events/route.ts)`);

    let outcome = await waitForStore([edited.uuid], expected, startedAt);
    quiet = (await waitForQuiet()) && quiet;
    line(
      "one listing edited",
      "ms" in outcome ? `stored after ${count(outcome.ms)} ms` : "not stored after 20 s",
      `${apiCalls(totalCallCount() - callsBefore)} (1 is enough)`,
      notQuiet(quiet),
    );
    if ("wrong" in outcome) {
      // Nothing is reaching the store, so the checks below would only wait, and so would putting the edit back.
      line("the other edit checks", "skipped, because they need this edit to reach the store first");
      putBackWaitMs = 5000;
      return;
    }

    // The queue has to follow the edit too, not only the stored review.
    const editedSeverity = worstSeverity(
      reviewListings(currentListings()).find((review) => review.listing.uuid === edited.uuid)!.issues,
    );
    const inQueue = await waitForQueueSeverity(edited.uuid, editedSeverity);
    line(
      "  its row in the queue",
      inQueue.ok
        ? `says ${severityName(editedSeverity)}, as the rules do`
        : `says ${severityName(inQueue.shown)} after 5 s, the rules say ${severityName(editedSeverity)}`,
    );

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
    quiet = await waitForQuiet();
    callsBefore = totalCallCount();
    const events = burst.flatMap((listing, index) => {
      const first = edit(listing, plainHttp(listing));
      return index % 5 === 0
        ? [first, edit(listing, { tagline: `${listing.tagline}, now with weekly summaries` })]
        : [first];
    });
    expected = expectedFindings();
    // A queue page that still calls the API would add its own calls to the count below, so it is not loaded then.
    const queuePage = queuePageCalls === 0 || queuePageCalls === null ? watchQueuePage() : null;
    startedAt = performance.now();
    const burstDelivery = await deliverEvents(events);
    outcome = await waitForStore(
      burst.map((listing) => listing.uuid),
      expected,
      startedAt,
      { timeoutMs: 60_000, everyMs: 500 },
    );
    const watched = await queuePage?.stop();
    quiet = (await waitForQuiet()) && quiet;
    const calls = totalCallCount() - callsBefore;

    line(
      `${BURST_SIZE} listings edited at once`,
      "ms" in outcome ? `all stored after ${count(outcome.ms)} ms` : `${outcome.wrong.length} not stored after 60 s`,
      `${apiCalls(calls)} (${BURST_SIZE} is enough), ${atLiveLimit(calls)}`,
      notQuiet(quiet),
    );
    line(
      "  slowest queue page meanwhile",
      ...(watched
        ? [
            `${count(watched.slowestMs)} ms`,
            watched.failed > 0 ? `${watched.failed} of ${watched.loads} loads failed (${watched.firstFailure})` : "",
          ]
        : ["not measured, because the queue page still calls the API"]),
    );
    line(
      "  slowest webhook answer",
      `${count(burstDelivery.slowestMs)} ms`,
      burstDelivery.failed > 0 ? `${burstDelivery.failed} events not accepted` : "",
    );
  } finally {
    await putEditsBack(putBackWaitMs);
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

  // And does the queue still show what the rules say, now that the edits are back?
  reportQueueSeverities("queue severities match the rules", (await allQueueRows()).rows, listings.length);
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

  heading("Pages");
  const queuePageCalls = await measurePage(`queue page ${QUEUE_PATH}`, QUEUE_PATH);
  await measurePage("listing page", `/listings/${listings[0]!.uuid}`);

  await measureStoredQueue(listings.length);

  try {
    await measureEdits(queuePageCalls);
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
