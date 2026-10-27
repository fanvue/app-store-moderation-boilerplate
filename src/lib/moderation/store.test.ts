import { PGlite } from '@electric-sql/pglite'
import { Kysely, PostgresDialect } from 'kysely'
import type { Pool } from 'pg'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { Database } from '@db/schema'
import { namedListings } from '@fixtures/listings'
import { migrate } from '@/lib/db/migrate'
import type { AppListing, AppListingSummary } from '@/lib/fanvue/types'

import type { Issue } from './rules'
import { createReviewStore, type ReviewStore } from './store'

/** Kysely over an in-memory PGlite, as in `src/lib/db/migrate.test.ts`. */
function kyselyOver(pglite: PGlite): Kysely<Database> {
  const client = {
    query: async (text: string, params: unknown[]) => {
      const result = await pglite.query(text, params)
      return { rowCount: result.affectedRows ?? 0, rows: result.rows }
    },
    release() {},
  }
  const pool = { connect: async () => client, end: async () => {} }
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool: pool as unknown as Pool }) })
}

const issue = (severity: Issue['severity']): Issue => ({
  code: `test_${severity}`,
  field: 'previewImageUrls',
  matched: 'https://example.com/one.png, https://example.com/one.png',
  message: `a ${severity} finding`,
  rule: '2.3',
  severity,
})

const [first, second, third, fourth] = namedListings as [AppListing, AppListing, AppListing, AppListing]

describe('review store', () => {
  let pglite: PGlite
  let db: Kysely<Database>
  let store: ReviewStore
  let runId: number

  beforeEach(async () => {
    pglite = new PGlite()
    db = kyselyOver(pglite)
    await migrate(db)
    store = createReviewStore(db)
    const run = await db
      .insertInto('review_runs')
      .values({ rule_revision: '3' })
      .returning('id')
      .executeTakeFirstOrThrow()
    runId = Number(run.id)
  })

  afterEach(async () => {
    await pglite.close()
  })

  const names = async () => (await store.getQueuePage({ page: 1, size: 10 })).rows.map(row => row.listing.name)

  it('puts unreviewed listings first, then the most serious, keeping submission order within a severity', async () => {
    await store.saveListings([first, second, third, fourth])
    await store.saveReviews(
      [
        { issues: [], listing: first },
        { issues: [issue('fix')], listing: second },
        { issues: [issue('warn'), issue('reject')], listing: fourth },
      ],
      '3',
      runId,
    )
    await db.updateTable('review_runs').set({ finished_at: new Date() }).execute()

    const page = await store.getQueuePage({ page: 1, size: 2 })

    expect(page.rows.map(row => [row.listing.name, row.review?.issues.length ?? null])).toEqual([
      [third.name, null],
      [fourth.name, 2],
    ])
    expect(page.total).toBe(4)
    expect(page.ruleRevision).toBe('3')
    expect(page.reviewedAt).not.toBeNull()
    expect((await store.getQueuePage({ page: 2, size: 2 })).rows.map(row => row.listing.name)).toEqual([
      second.name,
      first.name,
    ])
  })

  it('moves a listing to the end of submission order only when its worst severity changes', async () => {
    await store.saveListings([first, second, third])
    await store.saveReviews(
      [first, second, third].map(listing => ({ issues: [issue('fix')], listing })),
      '3',
      runId,
    )
    expect(await names()).toEqual([first.name, second.name, third.name])

    await store.saveReviews(
      [
        { issues: [issue('fix'), issue('fix')], listing: first },
        { issues: [issue('reject')], listing: second },
        { issues: [issue('fix')], listing: third },
      ],
      '3',
      runId,
    )
    expect(await names()).toEqual([second.name, first.name, third.name])

    await store.saveReviews([{ issues: [issue('fix')], listing: second }], '3', runId)
    expect(await names()).toEqual([first.name, third.name, second.name])
  })

  it('returns a stored listing as it was saved, and a summary without a review until the job reaches it', async () => {
    const { uuid, name, tagline, description, logoUrl, appUrl, pricingType, rating, developer } = first
    const summary: AppListingSummary = {
      appUrl,
      description,
      developer,
      logoUrl,
      name,
      pricingType,
      rating,
      tagline,
      uuid,
    }

    await store.saveListings([summary])
    expect(await store.getReview(first.uuid)).toEqual({ listing: summary, review: null })

    await store.saveListings([first])
    await store.saveReviews([{ issues: [issue('fix')], listing: first }], '3', runId)
    // A later summary must not wipe the detail columns.
    await store.saveListings([summary])

    const stored = await store.getReview(first.uuid)
    expect(stored?.listing).toEqual({ ...first, ratingDistribution: null })
    expect(stored?.review?.issues).toEqual([issue('fix')])
    expect(stored?.review?.ruleRevision).toBe('3')
    expect(await store.getReview('00000000-0000-4000-8000-000000000000')).toBeNull()
  })
})
