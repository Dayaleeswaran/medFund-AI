import "server-only";
import { getFintechConfig } from "@/lib/fintech/config";
import { fintechRequest } from "@/lib/fintech/client";

export async function getAccountTransactions(options: {
  accountNumber?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const cfg = getFintechConfig();
  const acc = options.accountNumber ?? cfg.balanceAccount;
  const now = new Date();
  const to = options.toDate ?? now.toISOString().slice(0, 10);
  const from =
    options.fromDate ??
    new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

  return fintechRequest("GET", cfg.transactionsPath, {
    query: {
      AccountNumber: acc,
      accountNumber: acc,
      FromDate: from,
      ToDate: to,
      fromDate: from,
      toDate: to,
      Page: options.page ?? 1,
      PageSize: options.pageSize ?? 50,
    },
  });
}
