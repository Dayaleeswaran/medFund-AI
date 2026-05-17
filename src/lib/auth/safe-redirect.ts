/**
 * Allow only same-app relative paths after auth. Blocks protocol-relative
 * redirects like `//evil.test` that `new URL(path, origin)` would upgrade.
 */
export function safeAuthNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  const s = (raw ?? fallback).trim();
  if (!s.startsWith("/") || s.startsWith("//") || s.includes(":")) {
    return fallback;
  }
  return s;
}
