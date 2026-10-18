/**
 * Runs the review job from the command line.
 *
 *   npm run review
 *
 * This is a separate process from `npm run dev`. If your store lives in the
 * Next process's memory, this cannot fill it; that is not a bug in the
 * script, it is the first design decision.
 */
import { getDb } from "@/lib/db/client";
import { runReviewJob } from "@/lib/moderation/review-job";

runReviewJob()
  .then(() => console.log("review job finished"))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => getDb().end());
