import "server-only";
import { getFintechConfig, FintechConfigError } from "@/lib/fintech/config";

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

export async function fintechRequest(
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
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
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

export function getClientKeyFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
