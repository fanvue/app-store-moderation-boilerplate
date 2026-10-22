/**
 * Runs the rules over the whole queue and prints what a moderator would face.
 *
 *   npm run metrics
 *
 * The generated listings break rules on fixed intervals (see
 * `fixtures/generated-listings.ts`), so "expected" is ground truth for them.
 * The README explains how to read 4.2, which has no expected count.
 */
import { generatedListings, GENERATED_LISTING_COUNT, listings } from "@fixtures/listings";

import { reviewListings } from "@/lib/moderation/rules";
import { SEVERITY_ORDER } from "@/lib/moderation/queue";

const EXPECTED_GENERATED: Record<string, (index: number) => boolean> = {
  "1.6": (i) => i % 31 === 0,
  "2.1": (i) => i % 43 === 0,
  "2.3": (i) => i % 17 === 0,
  "3.3": (i) => i % 37 === 0 || i % 47 === 0,
  "6.2": (i) => i % 23 === 0 || i % 29 === 0 || i % 41 === 0,
};

const started = performance.now();
const reviews = reviewListings(listings);
const elapsedMs = Math.round(performance.now() - started);

const generatedUuids = new Set(generatedListings.map((listing) => listing.uuid));
const listingsPerRule = new Map<string, { named: number; generated: number }>();
const findingsPerSeverity = { reject: 0, fix: 0, warn: 0 };
let clean = 0;

for (const { listing, issues } of reviews) {
  if (issues.length === 0) clean += 1;
  const rules = new Set(issues.map((issue) => issue.rule));
  for (const rule of rules) {
    const row = listingsPerRule.get(rule) ?? { named: 0, generated: 0 };
    if (generatedUuids.has(listing.uuid)) row.generated += 1;
    else row.named += 1;
    listingsPerRule.set(rule, row);
  }
  for (const issue of issues) findingsPerSeverity[issue.severity] += 1;
}

const expectedCount = (rule: string) => {
  const predicate = EXPECTED_GENERATED[rule];
  if (!predicate) return "-";
  let count = 0;
  for (let index = 0; index < GENERATED_LISTING_COUNT; index += 1) if (predicate(index)) count += 1;
  return String(count);
};

const rules = [...new Set([...Object.keys(EXPECTED_GENERATED), ...listingsPerRule.keys()])].sort();

console.log(`${reviews.length} listings reviewed in ${elapsedMs} ms\n`);
console.log("rule   named  generated  expected (generated)");
for (const rule of rules) {
  const row = listingsPerRule.get(rule) ?? { named: 0, generated: 0 };
  console.log(
    `${rule.padEnd(6)} ${String(row.named).padStart(5)}  ${String(row.generated).padStart(9)}  ${expectedCount(rule).padStart(8)}`,
  );
}

console.log(`\nfindings by severity: reject ${findingsPerSeverity.reject}, fix ${findingsPerSeverity.fix}, warn ${findingsPerSeverity.warn}`);
console.log(`listings with no findings: ${clean} of ${reviews.length}`);

const byWorst: Record<string, number> = { reject: 0, fix: 0, warn: 0, none: 0 };
for (const { issues } of reviews) {
  const worst = SEVERITY_ORDER.find((severity) => issues.some((issue) => issue.severity === severity)) ?? "none";
  byWorst[worst] = (byWorst[worst] ?? 0) + 1;
}
console.log(
  `listings by worst severity: reject ${byWorst.reject}, fix ${byWorst.fix}, warn ${byWorst.warn}, none ${byWorst.none}`,
);
console.log("which of those a person has to look at depends on the severities you chose in ASSUMPTIONS.md");
