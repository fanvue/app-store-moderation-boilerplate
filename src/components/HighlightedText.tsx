import type { Issue } from '@/lib/moderation/rules'

const escapeRegExp = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The matched text of every finding on `field`, for highlighting where it appears. */
export function matchesFor(issues: Issue[], field: string): string[] {
  return issues.flatMap(issue => (issue.field === field && issue.matched ? [issue.matched] : []))
}

/**
 * `text` with each occurrence of a term wrapped: `mark` underlines it in place
 * (listing copy), `chip` sets it as code (a finding's message).
 */
export function HighlightedText({
  text,
  terms,
  variant = 'mark',
}: {
  text: string
  terms: string[]
  variant?: 'mark' | 'chip'
}) {
  const unique = [...new Set(terms.filter(Boolean))]
  if (unique.length === 0) {
    return text
  }

  const parts = text.split(new RegExp(`(${unique.map(escapeRegExp).join('|')})`, 'g'))
  const segments = parts.map((part, index) => ({ offset: parts.slice(0, index).join('').length, part }))
  return segments.map(({ offset, part }) =>
    unique.includes(part) ? (
      variant === 'mark' ? (
        <mark
          key={offset}
          className='box-decoration-clone rounded-[4px] border-b-2 border-error-content bg-error-surface px-0.5 text-[var(--primitives-color-red-700)]'
        >
          {part}
        </mark>
      ) : (
        <code
          key={offset}
          className='box-decoration-clone rounded-[6px] border border-error-secondary bg-error-surface px-1.5 py-0.5 font-mono text-xs break-all text-[var(--primitives-color-red-700)]'
        >
          {part}
        </code>
      )
    ) : (
      part
    ),
  )
}
