/** Runs the review job: `npm run review`. */
import { getDb } from "@/lib/db/client";
import { runReviewJob } from "@/lib/moderation/review-job";

runReviewJob()
  .then(() => console.log("review job finished"))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => getDb().end());
