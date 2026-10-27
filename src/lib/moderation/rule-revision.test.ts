import { describe, expect, it } from 'vitest'

import { readRuleRevision } from './rule-revision'

describe('readRuleRevision', () => {
  it("reads the revision from the requirements doc's header", async () => {
    expect(await readRuleRevision()).toBe('3')
  })
})
