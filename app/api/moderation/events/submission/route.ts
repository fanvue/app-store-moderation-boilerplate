import { reviewSubmission } from '@/lib/moderation/review-job'

export const dynamic = 'force-dynamic'

/**
 * The webhook for a new submission: "Editing a listing or a pricing plan
 * starts a new submission, and a webhook reports it." Body: `{ "uuid": "…" }`.
 * Re-reviews the store and answers how many reviews changed.
 */
export async function POST(request: Request) {
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    // Not JSON: answered as a bad request below.
  }
  const uuid = body && typeof body === 'object' && 'uuid' in body && typeof body.uuid === 'string' ? body.uuid : null
  if (!uuid) {
    return Response.json({ message: 'body must be { uuid: string }' }, { status: 400 })
  }

  const result = await reviewSubmission(uuid)
  if (!result) {
    return Response.json({ message: 'App not found' }, { status: 404 })
  }

  return Response.json(result)
}
