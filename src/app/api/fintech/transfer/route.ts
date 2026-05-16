import { transferFundsInternal } from "@/lib/fintech/transfers";
import {
  fintechJson,
  handleFintechError,
  requireFintechConfigured,
  withFintechRateLimit,
} from "@/app/api/fintech/_shared";

type Body = {
  amount?: number;
  campaignId?: string;
  narration?: string;
};

function validBody(b: Body): string | null {
  if (typeof b.amount !== "number" || !Number.isFinite(b.amount)) {
    return "amount must be a number";
  }
  if (b.amount <= 0 || b.amount > 50_000_000) {
    return "amount out of allowed range";
  }
  if (typeof b.campaignId !== "string" || !b.campaignId.trim()) {
    return "campaignId required";
  }
  return null;
}

export async function POST(req: Request) {
  const rl = withFintechRateLimit(req);
  if (rl) return rl;
  const cfg = requireFintechConfigured();
  if (cfg) return cfg;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fintechJson({ error: "Invalid JSON body" }, 400);
  }

  const err = validBody(body);
  if (err) return fintechJson({ error: err }, 400);

  try {
    const reference = `MF-${body.campaignId}-${Date.now()}`;
    const result = await transferFundsInternal({
      amount: body.amount!,
      transactionReference: reference,
      narration:
        body.narration ??
        `MediFund donation campaign ${body.campaignId!.slice(0, 24)}`,
    });

    if (!result.ok) {
      return fintechJson(
        {
          error: "Transfer rejected by banking API",
          status: result.status,
          data: result.data,
        },
        502,
      );
    }

    return fintechJson({
      success: true,
      reference,
      status: result.status,
      data: result.data,
    });
  } catch (e) {
    return handleFintechError(e);
  }
}
