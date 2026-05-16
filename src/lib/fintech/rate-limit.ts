import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

const buckets = new Map<string, number[]>();

export function checkFintechRateLimit(clientKey: string): {
  ok: boolean;
  remaining: number;
  retryAfterSec?: number;
} {
  const now = Date.now();
  let arr = buckets.get(clientKey) ?? [];
  arr = arr.filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_REQUESTS) {
    const oldest = arr[0]!;
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    buckets.set(clientKey, arr);
    return { ok: false, remaining: 0, retryAfterSec };
  }
  arr.push(now);
  buckets.set(clientKey, arr);
  return { ok: true, remaining: MAX_REQUESTS - arr.length };
}
