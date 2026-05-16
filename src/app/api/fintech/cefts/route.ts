import { initiateCeftsTransfer } from "@/lib/fintech/cefts";
import {
  fintechJson,
  handleFintechError,
  requireFintechConfigured,
  withFintechRateLimit,
} from "@/app/api/fintech/_shared";

type Body = {
  amount?: number;
  beneficiaryAccountNumber?: string;
  beneficiaryBankCode?: string;
  campaignId?: string;
  remarks?: string;
};

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

  if (typeof body.amount !== "number" || body.amount <= 0) {
    return fintechJson({ error: "Invalid amount" }, 400);
  }
  if (
    typeof body.beneficiaryAccountNumber !== "string" ||
    !body.beneficiaryAccountNumber.trim()
  ) {
    return fintechJson({ error: "beneficiaryAccountNumber required" }, 400);
  }
  if (
    typeof body.beneficiaryBankCode !== "string" ||
    !body.beneficiaryBankCode.trim()
  ) {
    return fintechJson({ error: "beneficiaryBankCode required" }, 400);
  }

  const reference = `MF-CEFTS-${body.campaignId ?? "payout"}-${Date.now()}`;

  try {
    const result = await initiateCeftsTransfer({
      amount: body.amount,
      beneficiaryAccountNumber: body.beneficiaryAccountNumber.trim(),
      beneficiaryBankCode: body.beneficiaryBankCode.trim(),
      transactionReference: reference,
      remarks: body.remarks,
    });

    if (!result.ok) {
      return fintechJson(
        {
          error: "CEFTS transfer rejected",
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
