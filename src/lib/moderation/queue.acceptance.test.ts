/**
 * Acceptance tests: red until you build the queue. Do not edit these; make them pass.
 */
import { describe, expect, it } from "vitest";

import type { Issue } from "./rules";
import { sortQueue, worstSeverity } from "./queue";

const issue = (severity: Issue["severity"]): Issue => ({
  code: `test_${severity}`,
  rule: "0.0",
  severity,
  message: `test ${severity}`,
});

describe("queue (acceptance)", () => {
  it("worstSeverity picks reject over fix over warn, and null for no findings", () => {
    expect(worstSeverity([])).toBeNull();
    expect(worstSeverity([issue("warn")])).toBe("warn");
    expect(worstSeverity([issue("warn"), issue("fix")])).toBe("fix");
    expect(worstSeverity([issue("fix"), issue("reject"), issue("warn")])).toBe("reject");
  });

  it("sortQueue orders reject, fix, warn, then no findings, keeping order within a band", () => {
    const rows = [
      { name: "warn-1", issues: [issue("warn")] },
      { name: "clean-1", issues: [] },
      { name: "reject-1", issues: [issue("reject"), issue("warn")] },
      { name: "fix-1", issues: [issue("fix")] },
      { name: "warn-2", issues: [issue("warn"), issue("warn")] },
      { name: "clean-2", issues: [] },
      { name: "reject-2", issues: [issue("reject")] },
    ];

    const sorted = sortQueue(rows);

    expect(sorted.map((row) => row.name)).toEqual([
      "reject-1",
      "reject-2",
      "fix-1",
      "warn-1",
      "warn-2",
      "clean-1",
      "clean-2",
    ]);
    expect(rows.map((row) => row.name)[0]).toBe("warn-1");
  });
});
