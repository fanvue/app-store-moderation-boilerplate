import type { Issue, Severity } from "./rules";

/** Worst to mildest. Use it for ordering and for picking a listing's status. */
export const SEVERITY_ORDER: readonly Severity[] = ["reject", "fix", "warn"];

/**
 * The worst severity among a listing's findings, or `null` when there are none.
 *
 * TODO: implement. `src/lib/moderation/queue.acceptance.test.ts` says what is expected.
 */
export function worstSeverity(issues: Issue[]): Severity | null {
  return SEVERITY_ORDER.find((severity) => issues.some((issue) => issue.severity === severity)) ?? null;
}

/**
 * Orders queue rows worst first: reject, then fix, then warn, then rows with
 * no findings. Rows in the same band keep their original order.
 *
 * TODO: implement. Pure: return a new array, do not mutate `rows`.
 */
export function sortQueue<T extends { issues: Issue[] }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => severityRank(worstSeverity(left.issues)) - severityRank(worstSeverity(right.issues)));
}

function severityRank(severity: Severity | null): number {
  return severity === null ? SEVERITY_ORDER.length : SEVERITY_ORDER.indexOf(severity);
}
