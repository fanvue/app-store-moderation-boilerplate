import type { Issue, Severity } from "./rules";

/** Worst to mildest. Use it for ordering and for picking a listing's status. */
export const SEVERITY_ORDER: readonly Severity[] = ["reject", "fix", "warn"];

/**
 * The worst severity among a listing's findings, or `null` when there are none.
 * `null` means the rules ran and found nothing; a listing the job has not
 * reached has no stored review at all.
 *
 * TODO: implement.
 */
export function worstSeverity(issues: Issue[]): Severity | null {
  void issues;
  return null;
}

/**
 * Orders rows worst first in memory: reject, then fix, then warn, then rows
 * with no findings. Rows in the same band keep their original order.
 *
 * A helper, not the queue's ordering: worst first across pages has to come
 * from the store (`getQueuePage` in `store.ts`).
 *
 * TODO: implement if you need it.
 */
export function sortQueue<T extends { issues: Issue[] }>(rows: T[]): T[] {
  return rows;
}
