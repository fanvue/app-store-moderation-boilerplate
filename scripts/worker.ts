/**
 * The worker loop: calls `runWorkerStep` again and again. `npm run dev` runs
 * it and restarts it when a file changes.
 *
 * It also writes the `worker_heartbeat` row about once a second, so
 * `npm run measure` can tell that a worker is running.
 */
import { sql } from "kysely";

import { getDb } from "@/lib/db/client";
import { runWorkerStep } from "@/lib/moderation/worker";

const IDLE_MS = 250;
const AFTER_ERROR_MS = 1000;
const HEARTBEAT_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastBeat = 0;
async function beat(lastError: string | null): Promise<void> {
  if (Date.now() - lastBeat < HEARTBEAT_MS) return;
  lastBeat = Date.now();
  await getDb()
    .insertInto("worker_heartbeat")
    .values({ id: 1, last_error: lastError })
    .onConflict((conflict) => conflict.column("id").doUpdateSet({ beat_at: sql`now()`, last_error: lastError }))
    .execute()
    // The database may not be up or migrated yet. The next beat tries again.
    .catch(() => {});
}

let lastPrinted = "";
for (;;) {
  let problem: string | null = null;
  let worked = false;
  try {
    worked = await runWorkerStep();
  } catch (error) {
    problem = error instanceof Error ? error.message : String(error);
  }

  // Print a problem once, not once a second.
  if (problem && problem !== lastPrinted) console.error(`worker: ${problem}`);
  if (!problem && lastPrinted) console.log("worker: running");
  lastPrinted = problem ?? "";

  await beat(problem);
  if (problem) await sleep(AFTER_ERROR_MS);
  else if (!worked) await sleep(IDLE_MS);
}
