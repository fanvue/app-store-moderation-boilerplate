import { describe, expect, it } from "vitest";

import { listings } from "@fixtures/listings";

import { getApp, listApps } from "./api";

describe("listApps", () => {
  it("defaults to page 1 with 15 summaries per page", () => {
    const result = listApps();

    expect(result.pagination.page).toBe(1);
    expect(result.data).toHaveLength(Math.min(15, listings.length));
    expect(Object.keys(result.data[0] ?? {}).sort()).toEqual([
      "appUrl",
      "description",
      "developer",
      "logoUrl",
      "name",
      "pricingType",
      "rating",
      "tagline",
      "uuid",
    ]);
  });

  it("honours size and reports the number of records returned", () => {
    const result = listApps({ size: 4 });

    expect(result.data).toHaveLength(4);
    expect(result.pagination.size).toBe(4);
    expect(result.data.map((item) => item.uuid)).toEqual(listings.slice(0, 4).map((item) => item.uuid));
  });

  it("sets hasMore until the last page and paginates without overlap", () => {
    const first = listApps({ page: 1, size: 10 });
    const second = listApps({ page: 2, size: 10 });

    expect(first.pagination.hasMore).toBe(true);
    expect(second.pagination.hasMore).toBe(false);
    expect(first.data.length + second.data.length).toBe(listings.length);
    expect(new Set([...first.data, ...second.data].map((item) => item.uuid)).size).toBe(listings.length);
  });

  it("filters case-insensitively on name, tagline, description and developer name", () => {
    const target = listings[0]!;

    expect(listApps({ search: target.name.toUpperCase() }).data.map((item) => item.uuid)).toContain(target.uuid);
    expect(listApps({ search: target.tagline.slice(0, 12).toLowerCase() }).data.map((item) => item.uuid)).toContain(
      target.uuid,
    );
    expect(listApps({ search: "Demo Developer" }).data.length).toBeGreaterThan(0);
    expect(listApps({ search: "zzzz-no-such-app" }).data).toEqual([]);
  });
});

describe("getApp", () => {
  it("returns the full listing for a known uuid and null otherwise", () => {
    const target = listings[0]!;

    expect(getApp(target.uuid.toUpperCase())).toEqual(target);
    expect(getApp("00000000-0000-4000-8000-000000000000")).toBeNull();
  });
});
