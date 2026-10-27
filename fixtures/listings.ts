import type { AppListing } from '@/lib/fanvue/types'

import { generatedListings } from './generated-listings'
import { namedListings } from './named-listings'

export { GENERATED_LISTING_COUNT, generatedListings } from './generated-listings'
export { namedListings } from './named-listings'

/**
 * Every listing the mock API serves: the hand-written ones first, then the bulk
 * of the queue.
 *
 * `src/lib/moderation/spec.test.ts` is written against `namedListings` only.
 */
export const listings: AppListing[] = [...namedListings, ...generatedListings]
