import { listDecisions, recordDecision } from "@/lib/moderation/decisions";

export const dynamic = "force-dynamic";

/**
 * Moderator decisions over HTTP. If someone else decided the listing after this
 * moderator loaded it, answer `409` with the earlier decision. You choose how
 * the client says what it saw (a version, a timestamp, the previous decision's id).
 *
 * TODO, if you have time: implement POST. Storage is in `src/lib/moderation/decisions.ts`.
 */
export async function GET() {
  return Response.json({ decisions: await listDecisions() });
}

export async function POST(request: Request) {
  void request;
  void recordDecision;
  return Response.json({ message: "not implemented" }, { status: 501 });
}
