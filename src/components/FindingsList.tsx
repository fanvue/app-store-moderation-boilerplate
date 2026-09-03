import type { Issue } from "@/lib/moderation/rules";

/**
 * Findings for one listing, shown on the listing page.
 *
 * TODO (yours): make this useful to a moderator. Severity they can see at a
 * glance, the rule number, which field, what happens next, a link to the rule
 * in the doc. Tell "No findings" apart from "Not checked".
 */
export function FindingsList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    // TODO: this is ambiguous. Did no rules run, or did they all pass?
    return <p>No findings.</p>;
  }

  return (
    <ul className="list-disc pl-5">
      {issues.map((issue, index) => (
        <li key={`${issue.code}-${index}`}>
          [{issue.severity}] Rule {issue.rule}: {issue.message}
          {issue.field ? ` (field: ${issue.field})` : ""}
        </li>
      ))}
    </ul>
  );
}
