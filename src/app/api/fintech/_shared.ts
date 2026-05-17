import { NextResponse } from "next/server";
import { checkFintechRateLimit } from "@/lib/fintech/rate-limit";
import { getClientKeyFromRequest } from "@/lib/http/client-ip";
import {
  FintechConfigError,
  isFintechConfigured,
} from "@/lib/fintech/config";
import { FintechHttpError } from "@/lib/fintech/client";

export function fintechJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function withFintechRateLimit(req: Request) {
  const key = getClientKeyFromRequest(req);
  const lim = checkFintechRateLimit(`fintech:${key}`);
  if (!lim.ok) {
    return fintechJson(
      { error: "Rate limit exceeded", retryAfterSec: lim.retryAfterSec },
      429,
    );
  }
  return null;
}

export function requireFintechConfigured() {
  if (!isFintechConfigured()) {
    return fintechJson(
      {
        error:
          "Fintech is not configured. Set FINTECH_BASE_URL and FINTECH_API_KEY in .env.local.",
      },
      503,
    );
  }
  return null;
}

export function handleFintechError(e: unknown) {
  if (e instanceof FintechConfigError) {
    return fintechJson({ error: e.message }, 503);
  }
  if (e instanceof FintechHttpError) {
    return fintechJson(
      { error: e.message, details: e.body },
      e.status >= 400 ? e.status : 502,
    );
  }
  console.error("[fintech]", e);
  return fintechJson({ error: "Unexpected fintech error" }, 500);
}
