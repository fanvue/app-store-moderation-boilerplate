import type { ReactNode } from "react";

import type { QueueSeverity } from "@/lib/moderation/store";

/** Surface, text and dot colours for each worst severity. `none` is a listing where every rule passed. */
const TONE: Record<QueueSeverity, { pill: string; dot: string; label: string }> = {
  reject: {
    pill: "bg-error-surface text-[var(--primitives-color-red-700)]",
    dot: "bg-error-content",
    label: "Reject",
  },
  fix: { pill: "bg-warning-surface text-warning-content", dot: "bg-warning-secondary", label: "Fix" },
  warn: { pill: "bg-info-surface text-info-content", dot: "bg-info-secondary", label: "Warn" },
  none: { pill: "bg-success-surface text-success-content", dot: "bg-brand-primary-default", label: "Clear" },
};

/** A severity as a dotted pill, used by the queue and the listing page. `children` replaces the label. */
export function SeverityPill({
  severity,
  size = "md",
  children,
}: {
  severity: QueueSeverity;
  size?: "sm" | "md";
  children?: ReactNode;
}) {
  const tone = TONE[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-[0.04em] whitespace-nowrap uppercase ${tone.pill} ${
        size === "sm" ? "px-[9px] py-[3px] text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`size-1.5 rounded-full ${tone.dot}`} />
      {children ?? tone.label}
    </span>
  );
}
