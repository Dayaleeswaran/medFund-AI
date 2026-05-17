import "server-only";
import {
  getFintechConfig,
  FintechConfigError,
  type FintechConfig,
} from "@/lib/fintech/config";
import { getClientKeyFromRequest as getClientKeyFromRequestShared } from "@/lib/http/client-ip";

export class FintechHttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = "FintechHttpError";
  }
}

export type FintechRequestResult = {
  ok: boolean;
  status: number;
  data: unknown;
  rawText?: string;
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function buildHeaders(config: FintechConfig): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-Key": config.apiKey,
  };
  if (config.teamKey.trim()) {
    h[config.teamKeyHeader] = config.teamKey.trim();
  }
  return h;
}

async function fintechRequestOnce(
  method: "GET" | "POST",
  path: string,
  options?: {
    query?: Record<string, string | number | undefined | null>;
    body?: unknown;
  },
): Promise<FintechRequestResult> {
  let config;
  try {
    config = getFintechConfig();
  } catch (e) {
    if (e instanceof FintechConfigError) throw e;
    throw e;
  }

  const url = new URL(
    path.startsWith("http")
      ? path
      : `${config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`,
  );
  if (options?.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: buildHeaders(config),
      body:
        method === "POST" && options?.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const rawText = await res.text();
    let data: unknown = rawText;
    if (rawText) {
      try {
        data = JSON.parse(rawText) as unknown;
      } catch {
        data = { raw: rawText };
      }
    } else {
      data = null;
    }

    return { ok: res.ok, status: res.status, data, rawText };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new FintechHttpError("Fintech request timed out", 504, {
        error: "timeout",
      });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const RETRYABLE = new Set([502, 503, 504]);

export async function fintechRequest(
  method: "GET" | "POST",
  path: string,
  options?: {
    query?: Record<string, string | number | undefined | null>;
    body?: unknown;
  },
): Promise<FintechRequestResult> {
  let last: FintechRequestResult | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      last = await fintechRequestOnce(method, path, options);
      if (last.ok || !RETRYABLE.has(last.status)) {
        return last;
      }
      if (attempt < 2) await sleep(280 * 3 ** attempt);
    } catch (e) {
      const retry =
        attempt < 2 &&
        e instanceof FintechHttpError &&
        RETRYABLE.has(e.status);
      if (retry) {
        await sleep(280 * 3 ** attempt);
        continue;
      }
      throw e;
    }
  }
  return last!;
}

export function getClientKeyFromRequest(req: Request): string {
  return getClientKeyFromRequestShared(req);
}
