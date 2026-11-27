import { LIVE_RATE_LIMIT_PER_MINUTE } from "@/lib/fanvue/api";

/**
 * How many Fanvue API calls the server made while the page loaded. Calls the
 * webhook makes at the same time are counted too. `npm run measure` gives the
 * exact numbers.
 */
export function ApiCallCount({ calls }: { calls: number }) {
  return (
    <p className="mt-8 text-xs text-neutral-500">
      {calls.toLocaleString("en-US")} Fanvue API {calls === 1 ? "call" : "calls"} while this page loaded. The live API
      allows {LIVE_RATE_LIMIT_PER_MINUTE} a minute.
    </p>
  );
}
