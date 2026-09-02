import { getApp } from "@/lib/fanvue/api";

export const dynamic = "force-dynamic";

/**
 * Mock of the live `GET https://api.fanvue.com/v0/apps/{appUuid}`.
 *
 * Returns the full listing. Unlike the real endpoint it needs no bearer token
 * and ignores `X-Fanvue-API-Version`. Unknown uuid: `404 { message }`.
 */
export async function GET(_request: Request, context: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await context.params;
  const listing = getApp(uuid);

  if (!listing) return Response.json({ message: "App not found" }, { status: 404 });

  return Response.json(listing);
}
