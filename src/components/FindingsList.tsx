import type { StoredReview } from "@/lib/moderation/store";

/** Findings for one listing, shown on the listing page. `null` means the rules have not run on it yet. */
export function FindingsList({ review }: { review: StoredReview | null }) {
  if (!review) return <p className="text-neutral-500 italic">Not reviewed yet.</p>;

  return (
    <>
      {review.issues.length === 0 ? (
        <p>No findings.</p>
      ) : (
        <ul className="list-disc pl-5">
          {review.issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`}>
              [{issue.severity}] Rule {issue.rule}: {issue.message}
              {issue.field ? ` (field: ${issue.field})` : ""}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-neutral-500">
        Reviewed {review.reviewedAt} under requirements revision {review.ruleRevision}.
      </p>
    </>
  );
}
