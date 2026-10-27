'use client'

import type { ReactNode } from 'react'

import {
  Badge,
  Link as FanvueLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortLabel,
} from '@fanvue/ui'
import { createColumnHelper, FlexRender, rowSortingFeature, tableFeatures, useTable } from '@tanstack/react-table'

import { worstSeverity } from '@/lib/moderation/queue'
import type { QueueSort, StoredReview } from '@/lib/moderation/store'

import { queueHref, SORTABLE_COLUMNS } from './queueHref'
import { SEVERITY_BADGE } from './severityBadge'
import Link, { useLinkStatus } from 'next/link'

/** One queue row, flattened on the server so this component needs no store code. */
export type QueueRow = {
  uuid: string
  name: string
  developerHandle: string | null
  pricingType: string
  /** `null` until the job has made the listing's detail call. */
  screenshotCount: number | null
  review: StoredReview | null
}

/** Fixed widths, so the columns stay put when a sort brings in different rows. They add up to 100%. */
const COLUMN_WIDTH: Record<string, string> = {
  developer: 'w-[18%]',
  name: 'w-[22%]',
  pricingType: 'w-[10%]',
  screenshotCount: 'w-[10%]',
  severity: 'w-[10%]',
  status: 'w-[30%]',
}

/** The header label with its sort arrow, and an ellipsis while the store reads the newly sorted page. Must sit inside a `Link`. */
function SortLabel({ sorted, children }: { sorted: QueueSort['direction'] | false; children: ReactNode }) {
  const { pending } = useLinkStatus()
  return (
    <TableSortLabel direction={sorted || null}>
      {children}
      {pending ? ' …' : null}
    </TableSortLabel>
  )
}

function Severity({ review }: { review: StoredReview | null }) {
  if (!review) {
    return '-'
  }

  const worst = worstSeverity(review.issues)
  if (!worst) {
    return <Badge variant='successColour'>none</Badge>
  }

  return <Badge variant={SEVERITY_BADGE[worst]}>{worst}</Badge>
}

function Status({ review }: { review: StoredReview | null }) {
  if (!review) {
    return <span className='text-content-tertiary italic'>Not reviewed yet</span>
  }

  const count = review.issues.length
  if (count === 0) {
    return <span className='text-content-secondary'>No findings</span>
  }

  return (
    <span className='text-content-secondary'>
      {count === 1 ? '1 finding' : `${count} findings`}, rule{' '}
      {[...new Set(review.issues.map(issue => issue.rule))].join(', ')}
    </span>
  )
}

const features = tableFeatures({ rowSortingFeature })
const columnHelper = createColumnHelper<typeof features, QueueRow>()

const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    cell: ({ row }) => (
      <FanvueLink
        asChild
        size='14'
      >
        <Link href={`/listings/${row.original.uuid}`}>{row.original.name}</Link>
      </FanvueLink>
    ),
    enableSorting: false,
    header: 'App',
  }),
  columnHelper.accessor('developerHandle', {
    cell: ({ getValue }) => {
      const handle = getValue()
      return handle ? `@${handle}` : '-'
    },
    header: 'Developer',
    id: 'developer',
    sortDescFirst: false,
  }),
  columnHelper.accessor('pricingType', {
    enableSorting: false,
    header: 'Pricing',
  }),
  columnHelper.accessor('screenshotCount', {
    cell: ({ getValue }) => getValue() ?? '-',
    enableSorting: false,
    header: 'Screenshots',
  }),
  columnHelper.accessor(row => (row.review ? (worstSeverity(row.review.issues) ?? 'none') : null), {
    cell: ({ row }) => <Severity review={row.original.review} />,
    header: 'Severity',
    id: 'severity',
    sortDescFirst: false,
  }),
  columnHelper.display({
    cell: ({ row }) => <Status review={row.original.review} />,
    header: 'Status',
    id: 'status',
  }),
])

/**
 * The queue table. Sorting happens in the store across every page, so the
 * table only shows the current sort and turns the sortable headers into links.
 */
export function QueueTable({ rows, size, sort }: { rows: QueueRow[]; size: number; sort?: QueueSort }) {
  const table = useTable({
    columns,
    data: rows,
    features,
    getRowId: row => row.uuid,
    manualSorting: true,
    state: { sorting: sort ? [{ desc: sort.direction === 'desc', id: sort.column }] : [] },
  })

  return (
    <Table className='table-fixed'>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              const column = SORTABLE_COLUMNS.find(id => id === header.column.id)
              const sorted = header.column.getIsSorted()
              const next = header.column.getNextSortingOrder()
              return (
                <TableHead
                  key={header.id}
                  className={COLUMN_WIDTH[header.column.id]}
                >
                  {column && header.column.getCanSort() ? (
                    // A new sort starts again at page 1. The third click goes back to the default order.
                    <Link href={queueHref({ page: 1, size, sort: next ? { column, direction: next } : undefined })}>
                      <SortLabel sorted={sorted}>
                        <FlexRender header={header} />
                      </SortLabel>
                    </Link>
                  ) : (
                    <FlexRender header={header} />
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getAllCells().map(cell => (
              <TableCell
                key={cell.id}
                className='break-words'
              >
                <FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
