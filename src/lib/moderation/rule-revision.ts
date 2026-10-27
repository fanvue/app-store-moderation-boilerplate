import { readFile } from "node:fs/promises";
import path from "node:path";

/** The requirements doc. Its header names the revision the rules implement. */
export const REQUIREMENTS_DOC = path.join(process.cwd(), "docs", "listing-requirements.md");

/**
 * The revision in the doc's header: `"3"` from `**Revision 3, October 2026.**`.
 * Throws when the header is missing rather than store a guess. Only the job
 * calls this; the pages show the revision stored with each review.
 */
export async function readRuleRevision(doc = REQUIREMENTS_DOC): Promise<string> {
  const text = await readFile(doc, "utf8");
  const match = /^\*\*Revision (\d+)\b/m.exec(text);
  if (!match?.[1]) throw new Error(`no "**Revision N" header in ${doc}`);
  return match[1];
}
