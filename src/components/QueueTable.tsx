"use client";

import { ChevronRightIcon, TableSortLabel } from "@fanvue/ui";
import { FlexRender, createColumnHelper, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table";
import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

import { worstSeverity } from "@/lib/moderation/queue";
import type { QueueSort, StoredReview } from "@/lib/moderation/store";

import { queueHref, SORTABLE_COLUMNS, type QueueView } from "./queueHref";
import { SeverityPill } from "./SeverityPill";

/** One queue row, flattened on the server so this component needs no store code. */
export type QueueRow = {
  uuid: string;
  name: string;
  developerHandle: string | null;
  pricingType: string;
  /** `null` until the job has made the listing's detail call. */
  screenshotCount: number | null;
  review: StoredReview | null;
};

/**
 * Per column: a fixed width, so the columns stay put when a sort brings in
 * different rows (they add up to 100%), and the cell's padding and alignment.
 */
const COLUMN_CLASS: Record<string, { width: string; cell: string }> = {
  developer: { width: "w-[24%]", cell: "pl-5 pr-4" },
  severity: { width: "w-[13%]", cell: "px-4" },
  rules: { width: "w-[33%]", cell: "px-4" },
  pricingType: { width: "w-[13%]", cell: "px-4" },
  screenshotCount: { width: "w-[11%]", cell: "px-4 text-right tabular-nums" },
  open: { width: "w-[6%]", cell: "px-3 text-right" },
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Up to two initials from the app's name, ignoring digits and punctuation. */
const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

/**
 * The header label with its sort arrow, and an ellipsis while the store reads
 * the newly sorted page. `TableSortLabel` only draws an arrow on the sorted
 * column, so an unsorted one gets an up-and-down icon in the same 16px slot.
 * Must sit inside a `Link`.
 */
function SortLabel({ sorted, children }: { sorted: QueueSort["direction"] | false; children: ReactNode }) {
  const { pending } = useLinkStatus();
  return sorted ? (
    <TableSortLabel direction={sorted}>
      {children}
      {pending ? " …" : null}
    </TableSortLabel>
  ) : (
    <span className="inline-flex items-center gap-1 text-content-tertiary hover:text-content-primary">
      {children}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0"
        aria-hidden
      >
        <path d="M17 4v16m0 0-4-4m4 4 4-4M7 20V4m0 0L3 8m4-4 4 4" />
      </svg>
      {pending ? " …" : null}
    </span>
  );
}

/** The app's initials, name and developer, in one cell. */
function App({ row }: { row: QueueRow }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 flex-none items-center justify-center rounded-[12px] bg-surface-secondary text-[13px] font-bold text-content-secondary">
        {initials(row.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Link href={`/listings/${row.uuid}`} className="truncate text-sm font-semibold text-content-primary no-underline">
          {row.name}
        </Link>
        <span className="truncate text-[13px] text-content-tertiary">
          {row.developerHandle ? `@${row.developerHandle}` : "No handle"}
        </span>
      </div>
    </div>
  );
}

function Severity({ review }: { review: StoredReview | null }) {
  if (!review) return <span className="text-content-tertiary">-</span>;

  return <SeverityPill severity={worstSeverity(review.issues) ?? "none"} />;
}

/** One chip per rule that fired, then the number of findings. */
function Rules({ review }: { review: StoredReview | null }) {
  if (!review) return <span className="text-[13px] text-content-tertiary italic">Not reviewed yet</span>;

  const count = review.issues.length;
  if (count === 0) return <span className="text-[13px] text-content-tertiary">No findings</span>;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {[...new Set(review.issues.map((issue) => issue.rule))].map((rule) => (
        <span
          key={rule}
          className="rounded-[8px] border border-border-primary bg-background-secondary px-2 py-[3px] text-xs font-semibold text-content-primary tabular-nums"
        >
          {rule}
        </span>
      ))}
      <span className="text-[13px] text-content-tertiary">{count === 1 ? "1 finding" : `${count} findings`}</span>
    </div>
  );
}

const features = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof features, QueueRow>();

const columns = columnHelper.columns([
  // Sorts by developer handle, the only part of this column the store can sort by.
  columnHelper.accessor("developerHandle", {
    id: "developer",
    header: "App · developer",
    sortDescFirst: false,
    cell: ({ row }) => <App row={row.original} />,
  }),
  columnHelper.accessor((row) => (row.review ? (worstSeverity(row.review.issues) ?? "none") : null), {
    id: "severity",
    header: "Severity",
    sortDescFirst: false,
    cell: ({ row }) => <Severity review={row.original.review} />,
  }),
  columnHelper.display({
    id: "rules",
    header: "Rules triggered",
    cell: ({ row }) => <Rules review={row.original.review} />,
  }),
  columnHelper.accessor("pricingType", {
    header: "Pricing",
    enableSorting: false,
    cell: ({ getValue }) => capitalise(getValue()),
  }),
  columnHelper.accessor("screenshotCount", {
    header: "Screenshots",
    enableSorting: false,
    cell: ({ getValue }) => getValue() ?? "-",
  }),
  columnHelper.display({
    id: "open",
    header: () => <span className="sr-only">Open</span>,
    cell: ({ row }) => (
      <Link
        href={`/listings/${row.original.uuid}`}
        aria-label={`Open ${row.original.name}`}
        className="inline-flex size-11 items-center justify-center rounded-full text-content-primary"
      >
        <ChevronRightIcon size={16} />
      </Link>
    ),
  }),
]);

/**
 * The queue table. Sorting happens in the store across every page, so the
 * table only shows the current sort and turns the sortable headers into links.
 */
export function QueueTable({ rows, view }: { rows: QueueRow[]; view: QueueView }) {
  const { sort } = view;
  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.uuid,
    manualSorting: true,
    state: { sorting: sort ? [{ id: sort.column, desc: sort.direction === "desc" }] : [] },
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] table-fixed border-separate border-spacing-0 text-left">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const column = SORTABLE_COLUMNS.find((id) => id === header.column.id);
                const sorted = header.column.getIsSorted();
                const next = header.column.getNextSortingOrder();
                const style = COLUMN_CLASS[header.column.id];
                return (
                  <th
                    key={header.id}
                    scope="col"
                    className={`${style?.width} ${style?.cell} border-b border-border-primary py-3 text-[13px] font-semibold text-content-tertiary`}
                  >
                    {column && header.column.getCanSort() ? (
                      // A new sort starts again at page 1. The third click goes back to the default order.
                      <Link
                        href={queueHref({ ...view, page: 1, sort: next ? { column, direction: next } : undefined })}
                        className="no-underline"
                      >
                        <SortLabel sorted={sorted}>
                          <FlexRender header={header} />
                        </SortLabel>
                      </Link>
                    ) : (
                      <FlexRender header={header} />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`${COLUMN_CLASS[cell.column.id]?.cell} border-b border-surface-secondary py-4 align-middle text-sm text-content-primary`}
                >
                  <FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
