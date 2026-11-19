/**
 * Sends webhook events to the moderation tool, the way the Fanvue API does.
 * Needs `npm run dev` running.
 *
 *   npm run send-events               one "submitted" event for every listing
 *   npm run send-events -- --edit 20  edits 20 listings and sends "updated" for each
 */
import { deliverEvents, editListing, restoreListing, submittedEvents, WEBHOOK_URL } from "@/lib/fanvue/simulator";
import { currentListings, currentSubmission } from "@/lib/fanvue/mock-state";
import type { ListingEvent } from "@/lib/fanvue/events";

const args = process.argv.slice(2);
const editFlag = args.indexOf("--edit");
const editCount = editFlag === -1 ? 0 : Number(args[editFlag + 1] ?? 1);

if (args.some((arg) => arg !== "--edit" && !/^\d+$/.test(arg)) || !Number.isInteger(editCount) || editCount < 0) {
  console.error("usage: npm run send-events            (every listing)\n       npm run send-events -- --edit 20");
  process.exit(1);
}

/**
 * Edits `count` listings. A listing that has not been edited gets a plain
 * `http` app URL, which breaks 6.2. A listing edited before is put back.
 */
function editSome(count: number): ListingEvent[] {
  const listings = currentListings();
  const start = Math.floor(Math.random() * listings.length);
  return Array.from({ length: Math.min(count, listings.length) }, (_unused, offset) => {
    const listing = listings[(start + offset * 7) % listings.length]!;
    return currentSubmission(listing.uuid) % 2 === 1 && listing.appUrl?.startsWith("https://")
      ? editListing(listing.uuid, { appUrl: listing.appUrl.replace("https://", "http://") })
      : restoreListing(listing.uuid);
  });
}

const events = editFlag === -1 ? submittedEvents() : editSome(editCount);
const started = performance.now();
const report = await deliverEvents(events);
const seconds = ((performance.now() - started) / 1000).toFixed(1);

if (report.failed > 0) {
  console.error(
    `${report.failed.toLocaleString()} of ${report.events.toLocaleString()} events were not accepted by ${WEBHOOK_URL}: ${report.firstFailure}.\n` +
      "Is `npm run dev` running, and does the route answer 2xx?",
  );
  process.exitCode = 1;
} else {
  console.log(
    `${report.events.toLocaleString()} events sent to ${WEBHOOK_URL} in ${report.requests.toLocaleString()} requests (${seconds} s). ` +
      `Slowest answer ${report.slowestMs.toLocaleString()} ms.`,
  );
}
