/**
 * Acceptance tests: red until you have rules. Do not edit these; make them pass.
 * Your own tests for each rule go in `rules.test.ts`.
 */
import { describe, expect, it } from "vitest";

import { listings } from "@fixtures/listings";

import { validateListing } from "./rules";

describe("rules (acceptance)", () => {
  it("at least two different rules fire across the sample listings, and every finding is well formed", () => {
    const findings = listings.flatMap((listing) => validateListing(listing));

    for (const finding of findings) {
      expect(finding.rule, `rule number on ${finding.code}`).toMatch(/^\d+\.\d+$/);
      expect(["reject", "fix", "warn"]).toContain(finding.severity);
      expect(finding.message.trim().length, `message on ${finding.code}`).toBeGreaterThan(0);
    }

    const rules = new Set(findings.map((finding) => finding.rule));
    expect(rules.size, "distinct rule numbers cited").toBeGreaterThanOrEqual(2);
  });

  it("at least one sample listing has no findings", () => {
    const clean = listings.filter((listing) => validateListing(listing).length === 0);
    expect(clean.length).toBeGreaterThanOrEqual(1);
  });
});
