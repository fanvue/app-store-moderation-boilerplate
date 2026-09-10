/**
 * The acceptance criteria for the moderation rules. Read it, run it, don't edit it.
 *
 *   npm run test:spec
 *
 * Each row below is one of the hand-written listings in `fixtures/named-listings.ts`
 * and the rule sections that must fire for it. A listing with an empty list must
 * come back with no findings at all.
 *
 * What it deliberately does not tell you: how to detect any of it, how serious
 * any of it is, or what the message should say. Severity is your call and we
 * will ask you to defend it.
 */
import { describe, expect, it } from "vitest";

import { namedListings } from "@fixtures/listings";

import { reviewListings } from "./rules";

const EXPECTED: Record<string, string[]> = {
  "Insight Deck": [],
  "Post Planner": [],
  "Vault Tidy": [],
  "Audience Boost": ["1.6"],
  LinkPulse: ["2.1", "6.2"],
  "Clip Cutter": ["2.3"],
  "Caption Forge": ["3.3"],
  "Fan Radar": ["2.3", "6.2"],
  "Studio Ledger": ["3.3"],
  "Creator Copilot": ["4.2"],
  "Copilot for Creators": ["4.2"],
};

const reviews = reviewListings(namedListings);

const reviewFor = (name: string) => {
  const review = reviews.find((candidate) => candidate.listing.name === name);
  if (!review) throw new Error(`no listing named ${name} in fixtures/named-listings.ts`);
  return review;
};

describe("moderation spec", () => {
  it.each(Object.entries(EXPECTED))("%s breaks rules %j and nothing else", (name, expected) => {
    const fired = [...new Set(reviewFor(name).issues.map((issue) => issue.rule))].sort();

    expect(fired).toEqual([...expected].sort());
  });

  it("every finding is one a moderator could act on", () => {
    for (const { listing, issues } of reviews) {
      for (const issue of issues) {
        expect(issue.rule, `rule number on ${listing.name}`).toMatch(/^\d+\.\d+$/);
        expect(["reject", "fix", "warn"], `severity on ${listing.name}`).toContain(issue.severity);
        expect(issue.message.trim().length, `message on ${issue.code} (${listing.name})`).toBeGreaterThan(0);
        expect(issue.code.trim().length, `code on ${listing.name}`).toBeGreaterThan(0);
      }
    }
  });
});
