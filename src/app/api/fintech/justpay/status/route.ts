import { justPayTransactionStatus } from "@/lib/fintech/justpay";
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
  const query: Record<string, string | number | undefined | null> = {};
  url.searchParams.forEach((v, k) => {
    query[k] = v;
  });

  try {
    const result = await justPayTransactionStatus(query);
    if (!result.ok) {
      return fintechJson(
        {
          error: "JustPay status inquiry failed",
          status: result.status,
          data: result.data,
        },
        502,
      );
    }
    return fintechJson({ success: true, status: result.status, data: result.data });
  } catch (e) {
    return handleFintechError(e);
  }
}
