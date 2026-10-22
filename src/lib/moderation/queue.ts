import type { Issue, Severity } from "./rules";

/** Most serious first. Use it for ordering and for picking a listing's status. */
export const SEVERITY_ORDER: readonly Severity[] = ["reject", "fix", "warn"];

/**
 * The most serious severity among a listing's findings, or `null` when there
 * are none. `null` means the rules ran and found nothing. A listing the job has
 * not reached has no stored review at all.
 *
 * TODO: implement.
 */
export function worstSeverity(issues: Issue[]): Severity | null {
  void issues;
  return null;
}

/**
 * Sorts rows in memory, most serious first: reject, then fix, then warn, then
 * rows with no findings. Rows with the same severity keep their original order.
 *
 * This is only a helper. Sorting across pages has to come from the store
 * (`getQueuePage` in `store.ts`).
 *
 * TODO: implement if you need it.
 */
export function sortQueue<T extends { issues: Issue[] }>(rows: T[]): T[] {
  return rows;
}
