import "server-only";
import { getFintechConfig } from "@/lib/fintech/config";
import { fintechRequest } from "@/lib/fintech/client";

export async function justPayRegisterAccount(body: Record<string, unknown>) {
  const cfg = getFintechConfig();
  return fintechRequest("POST", cfg.justPay.registerPath, { body });
}

export async function justPayVerifyRegistration(body: Record<string, unknown>) {
  const cfg = getFintechConfig();
  return fintechRequest("POST", cfg.justPay.verifyPath, { body });
}

export async function justPayInitiateTransaction(body: Record<string, unknown>) {
  const cfg = getFintechConfig();
  return fintechRequest("POST", cfg.justPay.payPath, { body });
}

export async function justPayTransactionStatus(
  query: Record<string, string | number | undefined | null>,
) {
  const cfg = getFintechConfig();
  return fintechRequest("GET", cfg.justPay.statusPath, { query });
}
