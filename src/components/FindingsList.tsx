import type { Issue } from "@/lib/moderation/rules";

/**
 * Findings for one listing, shown on the listing page.
 *
 * TODO (yours): make this useful to a moderator. For example: severity visible
 * at a glance, the rule number, the field, what happens next, and a link to the
 * rule in the doc. Show "No findings" and "Not checked" differently.
 */
export function FindingsList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
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
