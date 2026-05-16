import "server-only";
import { getFintechConfig } from "@/lib/fintech/config";
import { fintechRequest } from "@/lib/fintech/client";

export async function getAccountBalance(accountNumber?: string) {
  const cfg = getFintechConfig();
  const acc = accountNumber ?? cfg.balanceAccount;
  const method = (
    process.env.FINTECH_BALANCE_HTTP_METHOD ?? "GET"
  ).toUpperCase();
  if (method === "POST") {
    return fintechRequest("POST", cfg.balancePath, {
      body: { AccountNumber: acc },
    });
  }
  return fintechRequest("GET", cfg.balancePath, {
    query: {
      AccountNumber: acc,
      accountNumber: acc,
    },
  });
}
