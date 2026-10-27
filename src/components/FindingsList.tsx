import { Badge, Card, CardContent, CardFooter, CardHeader, CardTitle, Link as FanvueLink } from '@fanvue/ui'

import type { Severity } from '@/lib/moderation/rules'
import type { StoredReview } from '@/lib/moderation/store'

import { formatReviewedAt } from './ReviewQueue'
import { SEVERITY_BADGE } from './severityBadge'
import Link from 'next/link'

/** What each severity means for the listing, from `rules.ts`. */
const NEXT_STEP: Record<Severity, string> = {
  fix: "The developer can correct this without anyone's judgement.",
  reject: 'Cannot go live as it is.',
  warn: 'A person should look.',
}

/**
 * Findings for one listing, shown on the listing page: severity, the rule that
 * fired, the field and the text that triggered it. `null` means the rules have
 * not run on the listing yet, which is different from no findings.
 */
export function FindingsList({ review }: { review: StoredReview | null }) {
  if (!review) {
    return <p className='text-content-tertiary italic'>Not reviewed yet.</p>
  }

  return (
    <>
      {review.issues.length === 0 ? (
        <Badge variant='successColour'>No findings. Every rule passed.</Badge>
      ) : (
        <ul className='flex flex-col gap-3'>
          {review.issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`}>
              <Card
                hierarchy='secondary'
                type='container'
                className='flex flex-col gap-2'
              >
                <CardHeader action={<Badge variant={SEVERITY_BADGE[issue.severity]}>{issue.severity}</Badge>}>
                  <CardTitle className='typography-body-small-14px-semibold'>
                    Rule {issue.rule}
                    {issue.field ? (
                      <span className='font-mono text-xs font-normal text-content-secondary'> · {issue.field}</span>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-1 typography-body-small-14px-regular'>
                  <p>{issue.message}</p>
                  {issue.matched ? (
                    <p>
                      Matched:{' '}
                      <mark className='rounded border border-border-strong bg-background-primary px-1 font-mono text-xs break-all text-content-primary'>
                        {issue.matched}
                      </mark>
                    </p>
                  ) : null}
                  {issue.relatedListingUuid ? (
                    <p>
                      Matches{' '}
                      <FanvueLink
                        asChild
                        size='14'
                      >
                        <Link href={`/listings/${issue.relatedListingUuid}`}>another listing</Link>
                      </FanvueLink>
                      .
                    </p>
                  ) : null}
                </CardContent>
                <CardFooter className='typography-description-12px-regular text-content-secondary'>
                  {NEXT_STEP[issue.severity]}
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className='mt-2 typography-description-12px-regular text-content-secondary'>
        Reviewed {formatReviewedAt(review.reviewedAt)} under requirements revision {review.ruleRevision}.
      </p>
    </>
  )
}
