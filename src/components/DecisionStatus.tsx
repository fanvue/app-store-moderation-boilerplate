import { Card } from '@fanvue/ui'

import type { ModeratorDecision } from '@/lib/moderation/decisions'

import { formatReviewedAt } from './ReviewQueue'

const DECIDED: Record<ModeratorDecision['decision'], { label: string; pill: string; dot: string }> = {
  approve: { dot: 'bg-brand-primary-default', label: 'Approved', pill: 'bg-success-surface text-success-content' },
  reject: {
    dot: 'bg-error-content',
    label: 'Rejected',
    pill: 'bg-error-surface text-[var(--primitives-color-red-700)]',
  },
  request_fixes: {
    dot: 'bg-warning-secondary',
    label: 'Fixes requested',
    pill: 'bg-warning-surface text-warning-content',
  },
}

/**
 * Whether a moderator has decided on the listing. Findings come from the rules
 * alone; this is the person's call, which is what tells "passed every rule"
 * from "a person cleared it".
 */
export function DecisionStatus({ decision }: { decision: ModeratorDecision | null }) {
  const tone = decision
    ? DECIDED[decision.decision]
    : { dot: 'bg-border-strong', label: 'Unreviewed', pill: 'bg-surface-secondary text-content-secondary' }

  return (
    <Card
      type='container'
      className='flex flex-col gap-3 rounded-[24px] bg-background-primary'
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-base leading-6 font-bold'>Moderator decision</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-[0.04em] uppercase ${tone.pill}`}
        >
          <span className={`size-1.5 rounded-full ${tone.dot}`} />
          {tone.label}
        </span>
      </div>
      {decision ? (
        <>
          <p className='text-[13px] leading-[18px] text-content-secondary'>
            {decision.moderator} · {formatReviewedAt(decision.decidedAt)} · revision {decision.ruleRevision}
          </p>
          {decision.note ? <p className='text-sm leading-5'>{decision.note}</p> : null}
        </>
      ) : (
        <p className='text-[13px] leading-[18px] text-content-secondary'>
          No moderator has decided on this listing yet. The findings come from the rules alone.
        </p>
      )}
    </Card>
  )
}
