// @vitest-environment jsdom
/**
 * Acceptance tests: red until you build the moderator's queue. Do not edit these; make them pass.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { listings } from "@fixtures/listings";

import type { Issue } from "@/lib/moderation/rules";

import { ReviewQueue } from "./ReviewQueue";

const issue = (severity: Issue["severity"]): Issue => ({
  code: `test_${severity}`,
  rule: "0.0",
  severity,
  message: `test ${severity}`,
});

const [a, b, c, d] = listings;
if (!a || !b || !c || !d) throw new Error("fixtures need at least four listings");

// Deliberately out of order: warn, clean, reject, fix.
const rows = [
  { listing: a, issues: [issue("warn")] },
  { listing: b, issues: [] },
  { listing: c, issues: [issue("reject"), issue("warn")] },
  { listing: d, issues: [issue("fix")] },
];

afterEach(cleanup);

describe("ReviewQueue (acceptance)", () => {
  it("shows every app with a status a moderator can read", () => {
    render(<ReviewQueue rows={rows} />);

    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(bodyRows).toHaveLength(rows.length);

    const rowFor = (name: string) => {
      const row = bodyRows.find((candidate) => within(candidate).queryByText(name));
      if (!row) throw new Error(`no row for ${name}`);
      return row.textContent ?? "";
    };

    expect(rowFor(c.name)).toMatch(/reject/i);
    expect(rowFor(d.name)).toMatch(/fix/i);
    expect(rowFor(a.name)).toMatch(/warn/i);
    expect(rowFor(b.name)).toMatch(/no findings|clean|pass/i);
  });

  it("lists the worst listings first", () => {
    render(<ReviewQueue rows={rows} />);

    const names = screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => [c.name, d.name, a.name, b.name].find((name) => within(row).queryByText(name)));

    expect(names).toEqual([c.name, d.name, a.name, b.name]);
  });
});
