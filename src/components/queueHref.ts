import type { QueueSort } from '@/lib/moderation/store'

/** The columns the store can sort by. Only these headers are links. */
export const SORTABLE_COLUMNS: readonly QueueSort['column'][] = ['severity', 'developer']

const DIRECTIONS: readonly QueueSort['direction'][] = ['asc', 'desc']

/** The sort in `?sort=…&dir=…`, or `undefined` for the default order when either is missing or unknown. */
export function parseQueueSort(sort: unknown, dir: unknown): QueueSort | undefined {
  const column = SORTABLE_COLUMNS.find(id => id === sort)
  const direction = DIRECTIONS.find(id => id === dir)
  return column && direction ? { column, direction } : undefined
}

/** The queue URL for one page, keeping the moderator's sort. */
export function queueHref({ page, size, sort }: { page: number; size: number; sort?: QueueSort }): string {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (sort) {
    params.set('sort', sort.column)
    params.set('dir', sort.direction)
  }
  return `/?${params}`
}
