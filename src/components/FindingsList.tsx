import { Card, Link as FanvueLink } from "@fanvue/ui";
import Link from "next/link";

import { SEVERITY_ORDER, worstSeverity } from "@/lib/moderation/queue";
import type { Issue, Severity } from "@/lib/moderation/rules";
import type { StoredReview } from "@/lib/moderation/store";

import { HighlightedText } from "./HighlightedText";
import { formatReviewedAt } from "./ReviewQueue";
import { SeverityPill } from "./SeverityPill";

/** What each severity means for the listing, from `rules.ts`. */
const NEXT_STEP: Record<Severity, string> = {
  reject: "Cannot go live as it is.",
  fix: "The developer can correct this without anyone's judgement.",
  warn: "A person should look.",
};

/** Each rule's heading in `docs/listing-requirements.md`. */
const RULE_TITLES: Record<string, string> = {
  "1.6": "No promotion of other platforms",
  "2.1": "Production ready",
  "2.3": "Listing quality",
  "3.3": "Pricing accuracy",
  "4.2": "Originality",
  "6.2": "Valid, owned URL",
};

/** The fields the listing page shows as copy, where a match is highlighted in place. */
export const HIGHLIGHTED_FIELDS = ["tagline", "description", "descriptionTitle", "descriptionBody", "highlights"];

type RuleGroup = {
  rule: string;
  issues: Issue[];
  worst: Severity;
};

/** Findings grouped by rule, most serious group first, keeping the rules' order within a severity. */
const groupByRule = (issues: Issue[]): RuleGroup[] =>
  [...new Set(issues.map((issue) => issue.rule))]
    .map((rule) => {
      const ruleIssues = issues.filter((issue) => issue.rule === rule);
      return { rule, issues: ruleIssues, worst: worstSeverity(ruleIssues) ?? "warn" };
    })
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.worst) - SEVERITY_ORDER.indexOf(b.worst));

/**
 * The findings card on the listing page, one block per rule that fired. `null`
 * means the rules have not run on the listing yet, which is different from no
 * findings.
 */
export function FindingsList({ review }: { review: StoredReview | null }) {
  return (
    <Card type="container" className="flex flex-col gap-4 rounded-[24px] bg-background-primary">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl leading-7 font-bold">Findings</h2>
        {review ? (
          <span className="text-[13px] text-content-tertiary">
            Reviewed {formatReviewedAt(review.reviewedAt)} · revision {review.ruleRevision}
          </span>
        ) : null}
      </div>

      {!review ? (
        <p className="text-sm text-content-tertiary italic">Not reviewed yet.</p>
      ) : review.issues.length === 0 ? (
        <p className="text-sm text-content-secondary">No findings. Every rule passed.</p>
      ) : (
        groupByRule(review.issues).map((group) => <RuleBlock key={group.rule} group={group} />)
      )}
    </Card>
  );
}

function RuleBlock({ group }: { group: RuleGroup }) {
  const highlightedBelow = group.issues.some(
    (issue) => issue.matched && issue.field && HIGHLIGHTED_FIELDS.includes(issue.field),
  );

  return (
    <div className="overflow-hidden rounded-[16px] border border-border-primary">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border-primary bg-background-secondary px-4 py-3.5">
        <span className="rounded-lg bg-content-primary px-2 py-0.5 text-xs font-bold text-background-primary tabular-nums">
          {group.rule}
        </span>
        <span className="text-sm font-semibold">{RULE_TITLES[group.rule] ?? `Rule ${group.rule}`}</span>
        <span className="ml-auto">
          <SeverityPill severity={group.worst} size="sm" />
        </span>
      </div>

      {group.issues.map((issue, index) => (
        <div
          key={`${issue.code}-${index}`}
          className="grid grid-cols-[minmax(120px,160px)_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-surface-secondary px-4 py-3.5"
        >
          <span className="font-mono text-xs leading-5 text-content-tertiary">{issue.field ?? "listing"}</span>
          <div className="flex min-w-0 flex-col gap-1.5 text-sm leading-5">
            <span>
              {/* The chip replaces the quotes the message puts around the matched text. */}
              <HighlightedText
                text={issue.matched ? issue.message.replaceAll(`"${issue.matched}"`, issue.matched) : issue.message}
                terms={issue.matched ? [issue.matched] : []}
                variant="chip"
              />
            </span>
            {issue.matched && !issue.message.includes(issue.matched) ? (
              <span>
                <HighlightedText text={issue.matched} terms={[issue.matched]} variant="chip" />
              </span>
            ) : null}
            {issue.relatedListingUuid ? (
              <span>
                Matches{" "}
                <FanvueLink asChild size="14">
                  <Link href={`/listings/${issue.relatedListingUuid}`}>another listing</Link>
                </FanvueLink>
                .
              </span>
            ) : null}
          </div>
        </div>
      ))}

      <p className="bg-background-primary px-4 py-3 text-[13px] leading-[18px] text-content-secondary">
        {NEXT_STEP[group.worst]}
        {highlightedBelow ? " Each match is highlighted in the copy below." : null}
      </p>
    </div>
  );
}
