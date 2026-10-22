import { listDecisions, recordDecision } from "@/lib/moderation/decisions";

export const dynamic = "force-dynamic";

/**
 * Moderator decisions over HTTP. A decision against a listing someone else
 * decided since this moderator loaded it answers `409` with the earlier
 * decision. How the client says what it saw (a version, a timestamp, the
 * previous decision's id) is yours.
 *
 * TODO: implement POST. Storage goes in `src/lib/moderation/decisions.ts`.
 */
export async function GET() {
  return Response.json({ decisions: await listDecisions() });
}

export async function POST(request: Request) {
  void request;
  void recordDecision;
  return Response.json({ message: "not implemented" }, { status: 501 });
}
