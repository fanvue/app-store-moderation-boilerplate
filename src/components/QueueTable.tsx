"use client";

import { FlexRender, createColumnHelper, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table";
import Link, { useLinkStatus } from "next/link";

import { worstSeverity } from "@/lib/moderation/queue";
import type { Severity } from "@/lib/moderation/rules";
import type { QueueSort, StoredReview } from "@/lib/moderation/store";

import { queueHref, SORTABLE_COLUMNS } from "./queueHref";

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

const SEVERITY_CLASS: Record<Severity, string> = {
  reject: "font-semibold text-red-700",
  fix: "font-semibold text-amber-700",
  warn: "text-sky-700",
};

const SORT_ARROW: Record<QueueSort["direction"], string> = {
  asc: " ↑",
  desc: " ↓",
};

/** The header's sort arrow, or an ellipsis while the store reads the newly sorted page. Must sit inside a `Link`. */
function SortIndicator({ sorted }: { sorted: QueueSort["direction"] | false }) {
  const { pending } = useLinkStatus();
  if (pending) return " …";
  return sorted ? SORT_ARROW[sorted] : " ↕";
}

function Severity({ review }: { review: StoredReview | null }) {
  if (!review) return "-";

  const worst = worstSeverity(review.issues);
  if (!worst) return <span className="text-green-700">none</span>;

  return <span className={SEVERITY_CLASS[worst]}>{worst}</span>;
}

function Status({ review }: { review: StoredReview | null }) {
  if (!review) return <span className="text-neutral-500 italic">Not reviewed yet</span>;

  const count = review.issues.length;
  if (count === 0) return <span className="text-green-700">No findings</span>;

  return (
    <span className="text-neutral-500">
      {count === 1 ? "1 finding" : `${count} findings`}, rule{" "}
      {[...new Set(review.issues.map((issue) => issue.rule))].join(", ")}
    </span>
  );
}

const features = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof features, QueueRow>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "App",
    enableSorting: false,
    cell: ({ row }) => (
      <Link href={`/listings/${row.original.uuid}`} className="underline">
        {row.original.name}
      </Link>
    ),
  }),
  columnHelper.accessor("developerHandle", {
    id: "developer",
    header: "Developer",
    sortDescFirst: false,
    cell: ({ getValue }) => {
      const handle = getValue();
      return handle ? `@${handle}` : "-";
    },
  }),
  columnHelper.accessor("pricingType", {
    header: "Pricing",
    enableSorting: false,
  }),
  columnHelper.accessor("screenshotCount", {
    header: "Screenshots",
    enableSorting: false,
    cell: ({ getValue }) => getValue() ?? "-",
  }),
  columnHelper.accessor((row) => (row.review ? (worstSeverity(row.review.issues) ?? "none") : null), {
    id: "severity",
    header: "Severity",
    sortDescFirst: false,
    cell: ({ row }) => <Severity review={row.original.review} />,
  }),
  columnHelper.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => <Status review={row.original.review} />,
  }),
]);

/**
 * The queue table. Sorting happens in the store across every page, so the
 * table only shows the current sort and turns the sortable headers into links.
 */
export function QueueTable({ rows, size, sort }: { rows: QueueRow[]; size: number; sort?: QueueSort }) {
  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.uuid,
    manualSorting: true,
    state: { sorting: sort ? [{ id: sort.column, desc: sort.direction === "desc" }] : [] },
  });

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b">
            {headerGroup.headers.map((header) => {
              const column = SORTABLE_COLUMNS.find((id) => id === header.column.id);
              const sorted = header.column.getIsSorted();
              const next = header.column.getNextSortingOrder();
              return (
                <th key={header.id} className="py-2 pr-4">
                  {column && header.column.getCanSort() ? (
                    // A new sort starts again at page 1. The third click goes back to the default order.
                    <Link href={queueHref({ page: 1, size, sort: next ? { column, direction: next } : undefined })}>
                      <FlexRender header={header} />
                      <SortIndicator sorted={sorted} />
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
          <tr key={row.id} className="border-b">
            {row.getAllCells().map((cell) => (
              <td key={cell.id} className="py-2 pr-4">
                <FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
