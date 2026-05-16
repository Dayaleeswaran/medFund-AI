import { getAccountBalance } from "@/lib/fintech/balance";
import { extractBalanceFields } from "@/lib/fintech/parsers";
import {
  fintechJson,
  handleFintechError,
  requireFintechConfigured,
  withFintechRateLimit,
} from "@/app/api/fintech/_shared";

export async function GET(req: Request) {
  const rl = withFintechRateLimit(req);
  if (rl) return rl;
  const cfg = requireFintechConfigured();
  if (cfg) return cfg;

  const url = new URL(req.url);
  const accountNumber = url.searchParams.get("accountNumber") ?? undefined;

  try {
    const result = await getAccountBalance(accountNumber ?? undefined);
    if (!result.ok) {
      return fintechJson(
        {
          error: "Balance inquiry failed",
          status: result.status,
          data: result.data,
        },
        502,
      );
    }
    const parsed = extractBalanceFields(result.data);
    return fintechJson({
      success: true,
      status: result.status,
      available: parsed.available,
      ledger: parsed.ledger,
      currency: parsed.currency,
      raw: result.data,
    });
  } catch (e) {
    return handleFintechError(e);
  }
}
