import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 60;

const buckets = new Map<string, number[]>();

export function checkAuthRouteRateLimit(clientKey: string): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  let arr = buckets.get(clientKey) ?? [];
  arr = arr.filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_REQUESTS) {
    const oldest = arr[0]!;
    buckets.set(clientKey, arr);
    return {
      ok: false,
      retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }
  arr.push(now);
  buckets.set(clientKey, arr);
  return { ok: true };
}
