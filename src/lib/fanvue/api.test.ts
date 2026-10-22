import { describe, expect, it } from "vitest";

import { listings } from "@fixtures/listings";

import { apiCallCount, getApp, listApps } from "./api";

describe("listApps", () => {
  it("defaults to page 1 with 15 summaries per page", async () => {
    const result = await listApps();

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

  it("honours size and reports the number of records returned", async () => {
    const result = await listApps({ size: 4 });

    expect(result.data).toHaveLength(4);
    expect(result.pagination.size).toBe(4);
    expect(result.data.map((item) => item.uuid)).toEqual(listings.slice(0, 4).map((item) => item.uuid));
  });

  it("sets hasMore until the last page and paginates without overlap", async () => {
    const size = 50;
    const lastPage = Math.ceil(listings.length / size);
    const first = await listApps({ page: 1, size });
    const last = await listApps({ page: lastPage, size });

    expect(first.pagination.hasMore).toBe(true);
    expect(last.pagination.hasMore).toBe(false);
    expect(new Set([...first.data, ...last.data].map((item) => item.uuid)).size).toBe(
      first.data.length + last.data.length,
    );
  });

  it("filters case-insensitively on name, tagline, description and developer name", async () => {
    const target = listings[0]!;

    expect((await listApps({ search: target.name.toUpperCase() })).data.map((item) => item.uuid)).toContain(target.uuid);
    expect(
      (await listApps({ search: target.tagline.slice(0, 12).toLowerCase() })).data.map((item) => item.uuid),
    ).toContain(target.uuid);
    expect((await listApps({ search: target.developer.name ?? "" })).data.length).toBeGreaterThan(0);
    expect((await listApps({ search: "zzzz-no-such-app" })).data).toEqual([]);
  });
});

describe("getApp", () => {
  it("returns the full listing for a known uuid and null otherwise", async () => {
    const target = listings[0]!;

    expect(await getApp(target.uuid.toUpperCase())).toEqual(target);
    expect(await getApp("00000000-0000-4000-8000-000000000000")).toBeNull();
  });

  it("counts every call, because the live API meters them", async () => {
    const before = apiCallCount();

    await getApp(listings[0]!.uuid);
    await listApps({ size: 1 });

    expect(apiCallCount() - before).toBe(2);
  });
});
