"use client";

import { Pagination } from "@fanvue/ui";
import { useRouter } from "next/navigation";

import { queueHref, type QueueView } from "./queueHref";

/** The queue's page buttons. `Pagination` renders buttons, not links, so each page change is a client navigation. */
export function QueuePagination({ page, pageCount, view }: { page: number; pageCount: number; view: QueueView }) {
  const router = useRouter();

  return (
    <Pagination
      currentPage={page}
      totalPages={pageCount}
      onPageChange={(target) => router.push(queueHref({ ...view, page: target }))}
    />
  );
}
