import { ListingDetail } from '@/components/ListingDetail'
import { createReviewStore } from '@/lib/moderation/store'

import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** One listing and its stored review, read from the review store. No API calls. */
export default async function ListingDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params

  const stored = UUID_PATTERN.test(uuid) ? await createReviewStore().getReview(uuid) : null
  if (!stored) {
    notFound()
  }

  return <ListingDetail stored={stored} />
}
