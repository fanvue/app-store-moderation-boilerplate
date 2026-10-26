import type { Issue } from "./rules";

/**
 * What a moderator decided about one listing, and what they were looking at.
 * Findings are recomputed on every run. A decision is the lasting record. The
 * README's "What done looks like" says what it must survive.
 */
export type ModeratorDecision = {
  listingUuid: string;
  decision: "approve" | "reject" | "request_fixes";
  /** Who decided. */
  moderator: string;
  /** ISO 8601. */
  decidedAt: string;
  /** The findings on screen when the decision was made. */
  findings: Issue[];
  /** The revision of the requirements doc the findings were produced under. */
  ruleRevision: string;
  /** What the developer reads. Separate from the moderator's own notes. */
  note: string | null;
};

/**
 * Stores a decision in Postgres.
 *
 * TODO, if you have time: implement, with a migration in `db/migrations/`. Change the signature
 * as you need. The route has to answer `409` with the earlier decision.
 */
export async function recordDecision(decision: ModeratorDecision): Promise<void> {
  void decision;
  throw new Error("recordDecision is not implemented");
}

/**
 * Every decision, newest first. The queue uses it to tell "passed every rule"
 * from "a person cleared it". TODO, if you have time: implement.
 */
export async function listDecisions(): Promise<ModeratorDecision[]> {
  return [];
}
