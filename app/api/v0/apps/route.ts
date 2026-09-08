import type { NextRequest } from "next/server";

import { DEFAULT_PAGE_SIZE, listApps, MAX_PAGE_SIZE } from "@/lib/fanvue/api";

export const dynamic = "force-dynamic";

/**
 * Mock of the live `GET https://api.fanvue.com/v0/apps`.
 *
 * Same query parameters and response envelope as the real endpoint. Unlike the
 * real one it needs no bearer token and ignores `X-Fanvue-API-Version`.
 * Validation failures answer `400 { errors: string[] }` (the spec's `ValidationError`).
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const errors: string[] = [];

  const page = parseIntParam(params.get("page"), 1);
  if (page === null || page < 1) errors.push("page must be an integer greater than or equal to 1");

  const size = parseIntParam(params.get("size"), DEFAULT_PAGE_SIZE);
  if (size === null || size < 1 || size > MAX_PAGE_SIZE) {
    errors.push(`size must be an integer between 1 and ${MAX_PAGE_SIZE}`);
  }

  if (errors.length > 0 || page === null || size === null) {
    return Response.json({ errors }, { status: 400 });
  }

  return Response.json(listApps({ page, size, search: params.get("search") }));
}

function parseIntParam(raw: string | null, fallback: number): number | null {
  if (raw === null || raw === "") return fallback;
  return /^\d+$/.test(raw) ? Number(raw) : null;
}
