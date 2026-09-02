import { getApp } from "@/lib/fanvue/api";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Mock of the live `GET https://api.fanvue.com/v0/apps/{appUuid}`.
 *
 * Returns the full listing. Unlike the real endpoint it needs no bearer token
 * and ignores `X-Fanvue-API-Version`. Malformed uuid: `400 { message }` (the
 * spec's `InvalidUuidError`). Unknown uuid: `404 { message }`.
 */
export async function GET(_request: Request, context: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await context.params;

  if (!UUID_PATTERN.test(uuid)) return Response.json({ message: "Invalid UUID format" }, { status: 400 });

  const listing = getApp(uuid);

  if (!listing) return Response.json({ message: "App not found" }, { status: 404 });

  return Response.json(listing);
}
