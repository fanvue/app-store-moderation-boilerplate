import type { Issue } from "@/lib/moderation/rules";

/** Findings for one listing, shown on the listing page. */
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
          {issue.evidence ? ` Matched: "${issue.evidence}"` : ""}
        </li>
      ))}
    </ul>
  );
}
