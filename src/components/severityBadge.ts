import type { BadgeVariant } from "@fanvue/ui";

import type { Severity } from "@/lib/moderation/rules";

/** Filled badges, keeping the colours the queue used before @fanvue/ui. Shared by the queue and the listing page. */
export const SEVERITY_BADGE: Record<Severity, BadgeVariant> = {
  reject: "errorColour",
  fix: "warningColour",
  warn: "infoColour",
};
