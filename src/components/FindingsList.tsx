"use client";

import { Badge, type BadgeVariant, EmptyState } from "@fanvue/ui";

import type { Issue, Severity } from "@/lib/moderation/rules";

export const SEVERITY_BADGE_VARIANT: Record<Severity, BadgeVariant> = {
  reject: "errorColour",
  fix: "warningColour",
  warn: "infoColour",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  reject: "Reject",
  fix: "Needs fix",
  warn: "Warning",
};

/**
 * Renders the findings for one listing. Deliberately minimal: extend it as the
 * rules in `src/lib/moderation/rules.ts` grow.
 */
export function FindingsList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <EmptyState
        variant="centered"
        titleSize="sm"
        title="No findings"
        description="validateListing() returned no issues for this listing."
      />
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {issues.map((issue, index) => (
        <li key={`${issue.code}-${index}`} className="flex flex-col gap-1 rounded-2xl border border-border-primary p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={SEVERITY_BADGE_VARIANT[issue.severity]} leftDot>
              {SEVERITY_LABEL[issue.severity]}
            </Badge>
            <span className="typography-description-12px-semibold text-content-secondary">Rule {issue.rule}</span>
            <code className="typography-description-12px-regular text-content-tertiary">{issue.code}</code>
          </div>
          <p className="typography-body-small-14px-regular m-0">{issue.message}</p>
          {issue.field ? (
            <p className="typography-description-12px-regular m-0 text-content-secondary">
              Field: <code>{issue.field}</code>
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
