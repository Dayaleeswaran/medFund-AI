import { z } from "zod";
import {
  fintechJson,
  handleFintechError,
  withFintechRateLimit,
} from "@/app/api/fintech/_shared";
import { fintechRequest } from "@/lib/fintech/client";
import { getFintechConfig, isFintechConfigured } from "@/lib/fintech/config";

const bodySchema = z.object({
  campaignId: z.string().min(1),
  amount: z.number().positive().optional(),
  memo: z.string().max(140).optional(),
});

/**
 * Builds a donation deep-link payload for QR rendering (client uses react-qr-code).
 * Optionally proxies Seylan sandbox QR Generate when configured — never exposes API keys.
 */
export async function POST(req: Request) {
  const rl = withFintechRateLimit(req);
  if (rl) return rl;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fintechJson({ error: "Invalid JSON" }, 400);
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return fintechJson({ error: "Invalid body", issues: parsed.error.flatten() }, 400);
  }

  const origin =
    req.headers.get("origin") ??
    req.headers.get("referer")?.split("/").slice(0, 3).join("/") ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    "";

  const { campaignId, amount, memo } = parsed.data;
  const qrPayload = `${origin}/campaign/${encodeURIComponent(campaignId)}?donate=1${amount ? `&amount=${encodeURIComponent(String(amount))}` : ""}${memo ? `&note=${encodeURIComponent(memo)}` : ""}`;

  if (!isFintechConfigured()) {
    return fintechJson({
      mode: "local",
      qrPayload,
      amount: amount ?? null,
      campaignId,
    });
  }

  try {
    const config = getFintechConfig();
    const body = {
      campaignId,
      amount: amount ?? null,
      currency: config.currencyCode,
      memo: memo ?? "MedFund AI donation",
      callbackUrl: origin ? `${origin}/api/fintech/health` : undefined,
    };

    const result = await fintechRequest("POST", config.qrGeneratePath, {
      body,
    });

    if (!result.ok) {
      return fintechJson(
        {
          mode: "fallback",
          qrPayload,
          bankError: result.data,
          status: result.status,
        },
        200,
      );
    }

    return fintechJson({
      mode: "sandbox",
      qrPayload,
      bank: result.data,
    });
  } catch (e) {
    return handleFintechError(e);
  }
}
