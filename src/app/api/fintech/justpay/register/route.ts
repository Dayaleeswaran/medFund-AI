import { justPayRegisterAccount } from "@/lib/fintech/justpay";
import {
  fintechJson,
  handleFintechError,
  requireFintechConfigured,
  withFintechRateLimit,
} from "@/app/api/fintech/_shared";

export async function POST(req: Request) {
  const rl = withFintechRateLimit(req);
  if (rl) return rl;
  const cfg = requireFintechConfigured();
  if (cfg) return cfg;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fintechJson({ error: "Invalid JSON body" }, 400);
  }

  try {
    const result = await justPayRegisterAccount(body);
    if (!result.ok) {
      return fintechJson(
        { error: "JustPay register failed", status: result.status, data: result.data },
        502,
      );
    }
    return fintechJson({ success: true, status: result.status, data: result.data });
  } catch (e) {
    return handleFintechError(e);
  }
}
