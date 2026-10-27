/**
 * Acceptance criteria for the listing rules. Do not edit.
 *
 *   npm run test:spec:listings
 *
 * Each row is a hand-written listing in `fixtures/named-listings.ts` and the
 * rules that must flag it. An empty list means no findings.
 */
import { describe, expect, it } from 'vitest'

import { namedListings } from '@fixtures/listings'

import { reviewListings } from './rules'

const EXPECTED: Record<string, string[]> = {
  'Audience Boost': ['1.6'],
  'Caption Forge': ['3.3'],
  'Clip Cutter': ['2.3'],
  'Copilot for Creators': ['4.2'],
  'Creator Copilot': ['4.2'],
  'Fan Radar': ['2.3', '6.2'],
  'Insight Deck': [],
  'Ledger Lite': [], // 4.2: same developer, shared boilerplate, not a resubmission
  'Ledger Pro': [], // 4.2: the other half of the pair
  LinkPulse: ['2.1', '6.2'],
  'Post Planner': [],
  'Studio Euro': ['3.3'], // 3.3: a EUR plan cannot be checked against a USD range
  'Studio Ledger': ['3.3'],
  // The cases the doc states explicitly. Read the sentence in the doc before the fixture.
  'Superfan Rewards': [], // 1.6: "the only fans who tip" is grammar, not a platform
  'Vault Tidy': [],
}

const reviews = reviewListings(namedListings)

const reviewFor = (name: string) => {
  const review = reviews.find(candidate => candidate.listing.name === name)
  if (!review) {
    throw new Error(`no listing named ${name} in fixtures/named-listings.ts`)
  }
  return review
}

describe('moderation spec', () => {
  it.each(Object.entries(EXPECTED))('%s breaks rules %j and nothing else', (name, expected) => {
    const fired = [...new Set(reviewFor(name).issues.map(issue => issue.rule))].sort()

    expect(fired).toEqual([...expected].sort())
  })

  it('every finding is one a moderator could act on', () => {
    for (const { listing, issues } of reviews) {
      for (const issue of issues) {
        expect(issue.rule, `rule number on ${listing.name}`).toMatch(/^\d+\.\d+$/)
        expect(['reject', 'fix', 'warn'], `severity on ${listing.name}`).toContain(issue.severity)
        expect(issue.message.trim().length, `message on ${issue.code} (${listing.name})`).toBeGreaterThan(0)
        expect(issue.code.trim().length, `code on ${listing.name}`).toBeGreaterThan(0)
      }
    }
  })
})
