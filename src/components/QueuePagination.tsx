"use client";

import { Pagination } from "@fanvue/ui";
import { useRouter } from "next/navigation";

import type { QueueSort } from "@/lib/moderation/store";

import { queueHref } from "./queueHref";

/** The queue's page buttons. `Pagination` renders buttons, not links, so each page change is a client navigation. */
export function QueuePagination({
  page,
  pageCount,
  size,
  sort,
}: {
  page: number;
  pageCount: number;
  size: number;
  sort?: QueueSort;
}) {
  const router = useRouter();

  return (
    <Pagination
      currentPage={page}
      totalPages={pageCount}
      onPageChange={(target) => router.push(queueHref({ page: target, size, sort }))}
    />
  );
}
