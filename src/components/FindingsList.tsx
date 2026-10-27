import type { Severity } from "@/lib/moderation/rules";
import type { StoredReview } from "@/lib/moderation/store";

import { formatReviewedAt } from "./ReviewQueue";

/** What each severity means for the listing, from `rules.ts`. */
const NEXT_STEP: Record<Severity, string> = {
  reject: "Cannot go live as it is.",
  fix: "The developer can correct this without anyone's judgement.",
  warn: "A person should look.",
};

const SEVERITY_CLASS: Record<Severity, string> = {
  reject: "bg-red-100 text-red-800",
  fix: "bg-amber-100 text-amber-800",
  warn: "bg-sky-100 text-sky-800",
};

/**
 * Findings for one listing, shown on the listing page: severity, the rule that
 * fired, the field and the text that triggered it. `null` means the rules have
 * not run on the listing yet, which is different from no findings.
 */
export function FindingsList({ review }: { review: StoredReview | null }) {
  if (!review) return <p className="text-neutral-500 italic">Not reviewed yet.</p>;

  return (
    <>
      {review.issues.length === 0 ? (
        <p className="text-green-700">No findings. Every rule passed.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {review.issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`} className="rounded border p-3">
              <p>
                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${SEVERITY_CLASS[issue.severity]}`}>
                  {issue.severity}
                </span>{" "}
                <span className="font-semibold">Rule {issue.rule}</span>
                {issue.field ? <span className="font-mono text-xs text-neutral-500"> · {issue.field}</span> : null}
              </p>
              <p className="mt-1">{issue.message}</p>
              {issue.matched ? (
                <p className="mt-1">
                  Matched: <mark className="bg-yellow-100 font-mono text-xs break-all">{issue.matched}</mark>
                </p>
              ) : null}
              {issue.relatedListingUuid ? (
                <p className="mt-1">
                  Matches{" "}
                  <a href={`/listings/${issue.relatedListingUuid}`} className="underline">
                    another listing
                  </a>
                  .
                </p>
              ) : null}
              <p className="mt-1 text-xs text-neutral-500">{NEXT_STEP[issue.severity]}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-neutral-500">
        Reviewed {formatReviewedAt(review.reviewedAt)} under requirements revision {review.ruleRevision}.
      </p>
    </>
  );
}
