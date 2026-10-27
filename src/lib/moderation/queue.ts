import type { Issue, Severity } from './rules'

/** Most serious first. Use it for ordering and for picking a listing's status. */
export const SEVERITY_ORDER: readonly Severity[] = ['reject', 'fix', 'warn']

/**
 * The most serious severity among a listing's findings, or `null` when there
 * are none. `null` means the rules ran and found nothing. A listing the job has
 * not reached has no stored review at all.
 */
export function worstSeverity(issues: Issue[]): Severity | null {
  for (const severity of SEVERITY_ORDER) {
    if (issues.some(issue => issue.severity === severity)) {
      return severity
    }
  }
  return null
}
