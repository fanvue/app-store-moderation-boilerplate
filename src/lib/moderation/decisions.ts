import type { Issue } from "./rules";

/**
 * What a moderator decided about one listing, and what they were looking at
 * when they decided it.
 *
 * Findings are recomputed every time the rules run, so they are not a record.
 * A decision is. It has to survive a restart, say which findings it was made
 * against, and say which revision of `docs/listing-requirements.md` those
 * findings came from, because the doc says revision 4 is coming and a listing
 * approved under revision 3 should not silently re-enter the queue.
 */
export type ModeratorDecision = {
  listingUuid: string;
  decision: "approve" | "reject" | "request_fixes";
  /** Who decided. Two moderators share this queue. */
  moderator: string;
  /** ISO 8601. */
  decidedAt: string;
  /** The findings on screen when the decision was made. */
  findings: Issue[];
  /** The revision of the requirements doc the findings were produced under. */
  ruleRevision: string;
  /** What the developer reads. Not the moderator's message. */
  note: string | null;
};

/**
 * Stores a decision. Where it goes is yours to choose, but it must still be
 * there after `npm run dev` restarts, and two moderators deciding the same
 * listing at the same time must not silently overwrite each other.
 *
 * TODO: implement. Say in `ASSUMPTIONS.md` what happens on a conflict.
 */
export async function recordDecision(decision: ModeratorDecision): Promise<void> {
  void decision;
  throw new Error("recordDecision is not implemented");
}

/**
 * Every decision ever made, newest first. The queue uses it to tell a listing
 * that passed every rule from one a person already cleared, and to keep
 * decided listings out of the way.
 *
 * TODO: implement.
 */
export async function listDecisions(): Promise<ModeratorDecision[]> {
  return [];
}
