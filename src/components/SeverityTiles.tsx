import type { QueueCounts, QueueSeverity } from '@/lib/moderation/store'

import { QUEUE_SEVERITIES, type QueueView, queueHref } from './queueHref'
import Link from 'next/link'

type Tile = {
  id: QueueSeverity | 'all'
  label: string
  hint: string
  dot: string
}

const ALL: Tile = { dot: 'bg-content-primary', hint: 'Every listing in the store', id: 'all', label: 'All listings' }

/** One tile per worst severity, worded from what each severity means in `rules.ts`. */
const TILES: Record<QueueSeverity, Tile> = {
  fix: { dot: 'bg-warning-secondary', hint: 'Developer can correct', id: 'fix', label: 'Fix' },
  none: { dot: 'bg-brand-primary-default', hint: 'Every rule passed', id: 'none', label: 'Clear' },
  reject: { dot: 'bg-error-content', hint: 'Cannot go live as they are', id: 'reject', label: 'Reject' },
  warn: { dot: 'bg-info-secondary', hint: 'A person should look', id: 'warn', label: 'Warn' },
}

/**
 * How many listings have each worst severity, as links that filter the queue.
 * A new filter starts again at page 1 and keeps the moderator's sort and search.
 */
export function SeverityTiles({ counts, view }: { counts: QueueCounts; view: QueueView }) {
  const tiles = [ALL, ...QUEUE_SEVERITIES.map(id => TILES[id])]

  return (
    <nav
      aria-label='Filter by worst severity'
      className='flex flex-wrap gap-3'
    >
      {tiles.map(tile => {
        const selected = tile.id === (view.severity ?? 'all')
        return (
          <Link
            key={tile.id}
            href={queueHref({ ...view, page: 1, severity: tile.id === 'all' ? undefined : tile.id })}
            aria-current={selected ? 'page' : undefined}
            // The border stays 1px; the inset shadow thickens it when selected, so nothing inside moves.
            className={`flex min-h-[108px] flex-[1_1_180px] flex-col items-start gap-1 rounded-[20px] border bg-background-primary px-[18px] py-4 no-underline ${
              selected
                ? 'border-content-primary shadow-[inset_0_0_0_1px_var(--color-content-primary)]'
                : 'border-border-primary'
            }`}
          >
            <span className='flex items-center gap-2 text-[13px] font-semibold text-content-secondary'>
              <span className={`size-2 rounded-full ${tile.dot}`} />
              {tile.label}
            </span>
            <span className='text-[28px] leading-[34px] font-bold tracking-[-0.02em] text-content-primary tabular-nums'>
              {counts[tile.id].toLocaleString('en-GB')}
            </span>
            <span className='text-xs text-content-tertiary'>{tile.hint}</span>
          </Link>
        )
      })}
    </nav>
  )
}
