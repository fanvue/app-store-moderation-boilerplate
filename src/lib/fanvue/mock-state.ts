/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is part of the mock of the live Fanvue API, which is someone else's system.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

import { appendFileSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { listings as fixtureListings } from "@fixtures/listings";

import type { AppListing } from "./types";

/**
 * What the mock API remembers between calls: the edits made to listings and a
 * log of every call. It is kept in files under `data/mock-api/` because the
 * web app, the worker and the scripts are separate processes and all of them
 * must see the same API. `npm run db:reset` deletes it with the database.
 *
 * Mock internals. Nothing in the moderation tool should import this file: the
 * tool reaches the API through `api.ts` and hears about edits through the
 * webhook.
 */

const stateDir = () => process.env.MOCK_API_STATE_DIR ?? path.join(process.cwd(), "data", "mock-api");
const editsFile = () => path.join(stateDir(), "edits.json");
const callsFile = () => path.join(stateDir(), "calls.log");

/** An edited listing: the copy the API now serves and how many times it has been submitted. */
type Edit = { submission: number; listing: AppListing };
type Edits = Record<string, Edit>;

let cached: { mtimeMs: number; edits: Edits; listings: AppListing[] } | null = null;

function load(): { edits: Edits; listings: AppListing[] } {
  let mtimeMs = 0;
  try {
    mtimeMs = statSync(editsFile()).mtimeMs;
  } catch {
    // No edits yet.
  }
  if (cached && cached.mtimeMs === mtimeMs) return cached;

  const edits: Edits = mtimeMs ? (JSON.parse(readFileSync(editsFile(), "utf8")) as Edits) : {};
  cached = { mtimeMs, edits, listings: fixtureListings.map((listing) => edits[listing.uuid]?.listing ?? listing) };
  return cached;
}

/** Every listing as the API serves it now, in submission order. Not counted as an API call. */
export function currentListings(): AppListing[] {
  return load().listings;
}

/** How many times a listing has been submitted. 1 until it is edited. */
export function currentSubmission(uuid: string): number {
  return load().edits[uuid]?.submission ?? 1;
}

/**
 * Replaces a listing with `listing` (or puts the original back when `null`)
 * and returns the new submission number.
 */
export function saveEdit(uuid: string, listing: AppListing | null): number {
  const original = fixtureListings.find((candidate) => candidate.uuid === uuid);
  if (!original) throw new Error(`no listing ${uuid}`);

  const edits = { ...load().edits };
  const submission = (edits[uuid]?.submission ?? 1) + 1;
  edits[uuid] = { submission, listing: listing ?? original };

  mkdirSync(stateDir(), { recursive: true });
  const temporary = `${editsFile()}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(edits));
  renameSync(temporary, editsFile());
  cached = null;
  return submission;
}

// One fixed-width line per call, so the number of calls is the file size
// divided by the line length and counting never reads the file.
const CALL_LINE_LENGTH = 16;

/** Adds one call to the log every process shares. */
export function recordCall(kind: "list" | "detail"): void {
  try {
    mkdirSync(stateDir(), { recursive: true });
    appendFileSync(callsFile(), `${String(Date.now()).padStart(13, "0")} ${kind === "list" ? "L" : "D"}\n`);
  } catch {
    // A call that cannot be logged is still served.
  }
}

/** Calls made to the mock API by every process since the last `npm run db:reset`. */
export function totalCallCount(): number {
  try {
    return Math.floor(statSync(callsFile()).size / CALL_LINE_LENGTH);
  } catch {
    return 0;
  }
}
