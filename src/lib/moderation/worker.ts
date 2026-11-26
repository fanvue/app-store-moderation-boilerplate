/**
 * One step of the background worker. `npm run dev` calls this in a loop for as
 * long as it runs, and starts the loop again when you save a file.
 *
 * Return `true` if the step did some work and `false` if there was nothing to
 * do. After `false` the loop waits a quarter of a second before the next call.
 * If the step throws, the loop prints the error and tries again a second later.
 *
 * TODO (yours): what a step does, and how much it does, is your design.
 */
export async function runWorkerStep(): Promise<boolean> {
  throw new Error("runWorkerStep is not implemented yet (src/lib/moderation/worker.ts)");
}
