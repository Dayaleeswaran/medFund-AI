import { getAccountTransactions } from "@/lib/fintech/transactions";
import {
  extractTransactionRows,
  mapBankRowToTransaction,
} from "@/lib/fintech/parsers";
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
  const fromDate = url.searchParams.get("fromDate") ?? undefined;
  const toDate = url.searchParams.get("toDate") ?? undefined;
  const walletId = url.searchParams.get("walletId") ?? "wlt-medifund";

  try {
    const result = await getAccountTransactions({
      accountNumber: accountNumber ?? undefined,
      fromDate,
      toDate,
    });
    if (!result.ok) {
      return fintechJson(
        {
          error: "Transaction history failed",
          status: result.status,
          data: result.data,
        },
        502,
      );
    }
    const rows = extractTransactionRows(result.data);
    const mapped = rows
      .map((r, i) => mapBankRowToTransaction(r, walletId, i))
      .filter((t): t is NonNullable<typeof t> => t !== null);

    return fintechJson({
      success: true,
      status: result.status,
      transactions: mapped,
      raw: result.data,
    });
  } catch (e) {
    return handleFintechError(e);
  }
}
