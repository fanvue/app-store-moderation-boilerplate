import { parseQueueSort } from "@/components/queueHref";
import { ReviewQueue } from "@/components/ReviewQueue";
import { createReviewStore } from "@/lib/moderation/store";

// Reads the store on every request: one page of stored reviews, no API calls.
export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 50;

/** A positive whole number from the query string, or `fallback`. */
function positiveInt(raw: string | string[] | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

/** The queue at `/?page=N&size=M&sort=severity|developer&dir=asc|desc`, read from the review store. */
export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = parseQueueSort(params.sort, params.dir);
  const queue = await createReviewStore().getQueuePage({
    page: positiveInt(params.page, 1),
    size: positiveInt(params.size, DEFAULT_PAGE_SIZE),
    sort,
  });

  return <ReviewQueue queue={queue} sort={sort} />;
}
