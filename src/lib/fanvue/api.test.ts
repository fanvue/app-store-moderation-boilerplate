import { describe, expect, it } from "vitest";

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { listings } from "@fixtures/listings";

import { apiCallCount, getApp, listApps } from "./api";
import type { ListingEventBatch } from "./events";
import { totalCallCount } from "./mock-state";
import { deliverEvents, editListing, restoreListing, submittedEvents } from "./simulator";

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

    expect((await listApps({ search: target.name.toUpperCase() })).data.map((item) => item.uuid)).toContain(
      target.uuid,
    );
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

describe("the shared call log", () => {
  it("counts the same calls, so another process can read the total", async () => {
    const before = totalCallCount();

    await getApp(listings[0]!.uuid);
    await listApps({ size: 1 });

    expect(totalCallCount() - before).toBe(2);
  });
});

describe("edits and events", () => {
  const target = listings[20]!;

  it("serves an edited listing from both endpoints and numbers the submission", async () => {
    const event = editListing(target.uuid, { tagline: "Edited tagline" });

    expect(event).toMatchObject({ type: "listing.updated", listingUuid: target.uuid, submission: 2 });
    expect((await getApp(target.uuid))!.tagline).toBe("Edited tagline");
    expect((await listApps({ search: "Edited tagline" })).data.map((item) => item.uuid)).toEqual([target.uuid]);

    const restored = restoreListing(target.uuid);

    expect(restored.submission).toBe(3);
    expect(restored.id).not.toBe(event.id);
    expect(await getApp(target.uuid)).toEqual(target);
  });

  it("has one submitted event per listing", () => {
    const events = submittedEvents();

    expect(events).toHaveLength(listings.length);
    expect(new Set(events.map((event) => event.id)).size).toBe(listings.length);
    expect(events.find((event) => event.listingUuid === target.uuid)!.submission).toBe(3);
  });

  /** A webhook on a free local port that answers every event with `status`. */
  async function webhook(status: number) {
    const received: string[] = [];
    const server = createServer((request, response) => {
      let body = "";
      request.on("data", (chunk) => (body += chunk));
      request.on("end", () => {
        received.push(...(JSON.parse(body) as ListingEventBatch).events.map((event) => event.id));
        response.writeHead(status).end();
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    return {
      received,
      url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/events`,
      close: () => new Promise((resolve) => server.close(resolve)),
    };
  }

  it("delivers every event, some of them twice", async () => {
    const hook = await webhook(204);
    const events = submittedEvents().slice(0, 40);

    const report = await deliverEvents(events, { url: hook.url });
    const everything = await deliverEvents(submittedEvents(), { url: hook.url, duplicateEvery: 0 });
    await hook.close();

    expect(everything.requests).toBe(Math.ceil(listings.length / 100));

    expect(report).toMatchObject({ events: 40, requests: 1, failed: 0, firstFailure: null });
    const first = hook.received.slice(0, 44);
    expect(new Set(first)).toEqual(new Set(events.map((event) => event.id)));
    expect(first).not.toEqual([...first].sort());
  });

  it("reports events that were not accepted, and gives up early", async () => {
    const hook = await webhook(501);

    const report = await deliverEvents(submittedEvents(), { url: hook.url, concurrency: 1 });
    await hook.close();

    expect(report.failed).toBe(listings.length);
    expect(report.firstFailure).toBe("the webhook answered 501");
    expect(report.requests).toBe(3);
  });
});
