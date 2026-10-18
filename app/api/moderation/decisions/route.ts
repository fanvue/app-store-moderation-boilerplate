import { listDecisions, recordDecision } from "@/lib/moderation/decisions";

export const dynamic = "force-dynamic";

/**
 * Moderator decisions over HTTP, so the queue can write them and another
 * moderator's screen can read them.
 *
 * Two moderators share the queue. A decision written against a listing that
 * someone else has decided since this moderator loaded it must answer `409`
 * with the decision that got there first, so the screen can show it rather
 * than overwrite it. How the client says what it saw (a version, a timestamp,
 * the previous decision's id) is yours.
 *
 * TODO: implement both handlers. The stubs in `src/lib/moderation/decisions.ts`
 * are where the storage goes.
 */
export async function GET() {
  return Response.json({ decisions: await listDecisions() });
}

export async function POST(request: Request) {
  void request;
  void recordDecision;
  return Response.json({ message: "not implemented" }, { status: 501 });
}
