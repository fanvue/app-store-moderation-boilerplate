import type { Issue } from "@/lib/moderation/rules";

const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The matched text of every finding on `field`, for highlighting where it appears. */
export function matchesFor(issues: Issue[], field: string): string[] {
  return issues.flatMap((issue) => (issue.field === field && issue.matched ? [issue.matched] : []));
}

/**
 * `text` with each occurrence of a term wrapped: `mark` underlines it in place
 * (listing copy), `chip` sets it as code (a finding's message).
 */
export function HighlightedText({
  text,
  terms,
  variant = "mark",
}: {
  text: string;
  terms: string[];
  variant?: "mark" | "chip";
}) {
  const unique = [...new Set(terms.filter(Boolean))];
  if (unique.length === 0) return text;

  const parts = text.split(new RegExp(`(${unique.map(escape).join("|")})`, "g"));
  return parts.map((part, index) =>
    unique.includes(part) ? (
      variant === "mark" ? (
        <mark
          key={index}
          className="box-decoration-clone rounded-[4px] border-b-2 border-error-content bg-error-surface px-0.5 text-[var(--primitives-color-red-700)]"
        >
          {part}
        </mark>
      ) : (
        <code
          key={index}
          className="box-decoration-clone rounded-[6px] border border-error-secondary bg-error-surface px-1.5 py-0.5 font-mono text-xs break-all text-[var(--primitives-color-red-700)]"
        >
          {part}
        </code>
      )
    ) : (
      part
    ),
  );
}
