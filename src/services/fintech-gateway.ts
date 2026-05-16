import type { Transaction } from "@/types";

export async function fintechHealth(): Promise<{ configured: boolean }> {
  const res = await fetch("/api/fintech/health", { cache: "no-store" });
  if (!res.ok) return { configured: false };
  return (await res.json()) as { configured: boolean };
}

export async function fintechTransferDonation(params: {
  amount: number;
  campaignId: string;
  narration?: string;
}): Promise<{ success: boolean; reference: string; data: unknown }> {
  const res = await fetch("/api/fintech/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Transfer failed",
    );
  }
  return data as { success: boolean; reference: string; data: unknown };
}

export async function fintechGetBalance(accountNumber?: string): Promise<{
  available: number | null;
  ledger: number | null;
  currency: string | null;
  raw: unknown;
}> {
  const url = new URL("/api/fintech/balance", window.location.origin);
  if (accountNumber) url.searchParams.set("accountNumber", accountNumber);
  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : "Balance request failed",
    );
  }
  return data as {
    available: number | null;
    ledger: number | null;
    currency: string | null;
    raw: unknown;
  };
}

export async function fintechGetHistory(options?: {
  accountNumber?: string;
  walletId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<{ transactions: Transaction[] }> {
  const url = new URL("/api/fintech/history", window.location.origin);
  if (options?.accountNumber)
    url.searchParams.set("accountNumber", options.accountNumber);
  if (options?.walletId) url.searchParams.set("walletId", options.walletId);
  if (options?.fromDate) url.searchParams.set("fromDate", options.fromDate);
  if (options?.toDate) url.searchParams.set("toDate", options.toDate);
  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : "History request failed",
    );
  }
  return data as { transactions: Transaction[] };
}

export async function fintechCeftsPayout(body: {
  amount: number;
  beneficiaryAccountNumber: string;
  beneficiaryBankCode: string;
  campaignId?: string;
  remarks?: string;
}): Promise<{ success: boolean; reference: string; data: unknown }> {
  const res = await fetch("/api/fintech/cefts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : "CEFTS transfer failed",
    );
  }
  return data as { success: boolean; reference: string; data: unknown };
}

export async function justPayRegister(
  body: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch("/api/fintech/justpay/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : "JustPay register failed",
    );
  }
  return data;
}

export async function justPayVerify(
  body: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch("/api/fintech/justpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : "JustPay verify failed",
    );
  }
  return data;
}

export async function justPayPay(
  body: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch("/api/fintech/justpay/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : "JustPay payment failed",
    );
  }
  return data;
}

export async function justPayStatus(
  query: Record<string, string>,
): Promise<unknown> {
  const url = new URL("/api/fintech/justpay/status", window.location.origin);
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : "JustPay status failed",
    );
  }
  return data;
}
