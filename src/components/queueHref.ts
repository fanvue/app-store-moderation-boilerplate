import type { QueueSeverity, QueueSort } from "@/lib/moderation/store";

/** The columns the store can sort by. Only these headers are links. */
export const SORTABLE_COLUMNS: readonly QueueSort["column"][] = ["severity", "developer"];

const DIRECTIONS: readonly QueueSort["direction"][] = ["asc", "desc"];

/** The worst severities the queue can filter by, in the order the tiles show them. */
export const QUEUE_SEVERITIES: readonly QueueSeverity[] = ["reject", "fix", "warn", "none"];

/** What the moderator is looking at, apart from the page: every queue link keeps it. */
export type QueueView = {
  size: number;
  sort?: QueueSort;
  severity?: QueueSeverity;
  q?: string;
};

/** The sort in `?sort=…&dir=…`, or `undefined` for the default order when either is missing or unknown. */
export function parseQueueSort(sort: unknown, dir: unknown): QueueSort | undefined {
  const column = SORTABLE_COLUMNS.find((id) => id === sort);
  const direction = DIRECTIONS.find((id) => id === dir);
  return column && direction ? { column, direction } : undefined;
}

/** The filter in `?severity=…`, or `undefined` for every listing when it is missing or unknown. */
export function parseQueueSeverity(severity: unknown): QueueSeverity | undefined {
  return QUEUE_SEVERITIES.find((id) => id === severity);
}

/** The search in `?q=…`, trimmed, or `undefined` when it is missing or blank. */
export function parseQueueSearch(q: unknown): string | undefined {
  return typeof q === "string" && q.trim() ? q.trim() : undefined;
}

/** The queue URL for one page of a view. */
export function queueHref({ page, size, sort, severity, q }: QueueView & { page: number }): string {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (sort) {
    params.set("sort", sort.column);
    params.set("dir", sort.direction);
  }
  if (severity) params.set("severity", severity);
  if (q) params.set("q", q);
  return `/?${params}`;
}
