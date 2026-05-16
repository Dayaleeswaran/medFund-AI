import type { Transaction } from "@/types";

function num(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))
    return Number(v);
  return null;
}

function str(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return null;
}

export function extractBalanceFields(data: unknown): {
  available: number | null;
  ledger: number | null;
  currency: string | null;
  raw: unknown;
} {
  const walk = (o: unknown): Record<string, unknown> | null => {
    if (typeof o !== "object" || o === null) return null;
    return o as Record<string, unknown>;
  };

  let cur: Record<string, unknown> | null = walk(data);
  if (cur?.data) cur = walk(cur.data) ?? cur;
  if (cur?.Data) cur = walk(cur.Data) ?? cur;
  if (!cur) {
    return { available: null, ledger: null, currency: null, raw: data };
  }

  const keysAvail = [
    "AvailableBalance",
    "availableBalance",
    "Available",
    "ClearBalance",
    "Balance",
    "balance",
    "AccountBalance",
  ];
  const keysLedger = [
    "LedgerBalance",
    "ledgerBalance",
    "ActualBalance",
    "BookBalance",
  ];

  let available: number | null = null;
  let ledger: number | null = null;

  for (const k of keysAvail) {
    if (k in cur) {
      available = num(cur[k]);
      if (available !== null) break;
    }
  }
  for (const k of keysLedger) {
    if (k in cur) {
      ledger = num(cur[k]);
      if (ledger !== null) break;
    }
  }

  const currency =
    str(cur.CurrencyCode) ??
    str(cur.currencyCode) ??
    str(cur.Currency) ??
    str(cur.currency);

  return { available, ledger, currency, raw: cur };
}

function collectArrays(obj: unknown, out: unknown[][]): void {
  if (Array.isArray(obj)) {
    out.push(obj);
    return;
  }
  if (typeof obj !== "object" || obj === null) return;
  for (const v of Object.values(obj)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object") {
      out.push(v as unknown[]);
    } else collectArrays(v, out);
  }
}

export function extractTransactionRows(data: unknown): unknown[] {
  const arrays: unknown[][] = [];
  collectArrays(data, arrays);
  if (arrays.length === 0) return [];
  return arrays.reduce((a, b) => (a.length >= b.length ? a : b));
}

export function mapBankRowToTransaction(
  row: unknown,
  walletId: string,
  index: number,
): Transaction | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;

  const amount =
    num(r.Amount) ??
    num(r.amount) ??
    num(r.TransactionAmount) ??
    num(r.DebitAmount) ??
    num(r.CreditAmount) ??
    0;

  const desc =
    str(r.Description) ??
    str(r.Narration) ??
    str(r.Remarks) ??
    str(r.TransactionType) ??
    "Bank movement";

  const when =
    str(r.TransactionDate) ??
    str(r.ValueDate) ??
    str(r.PostingDate) ??
    str(r.Date) ??
    new Date().toISOString();

  const ref =
    str(r.Reference) ??
    str(r.TransactionReference) ??
    str(r.Id) ??
    `row-${index}`;

  const cd =
    str(r.CreditDebitIndicator) ?? str(r.DRCR) ?? str(r.Type) ?? "";
  const debitAmt = num(r.DebitAmount);
  const creditAmt = num(r.CreditAmount);
  let type: Transaction["type"] = "inflow";
  if (/debit|^dr|^out/i.test(cd)) type = "outflow";
  else if (/credit|^cr|^in/i.test(cd)) type = "inflow";
  else if (debitAmt && debitAmt > 0) type = "outflow";
  else if (creditAmt && creditAmt > 0) type = "inflow";
  else if (amount < 0) type = "outflow";

  const running =
    num(r.RunningBalance) ??
    num(r.BalanceAfter) ??
    num(r.ClosingBalance) ??
    null;

  return {
    id: `bank-${ref}-${index}`,
    wallet_id: walletId,
    type,
    amount: Math.abs(amount) || Math.abs(debitAmt ?? 0) || Math.abs(creditAmt ?? 0),
    description: desc,
    campaign_id: null,
    created_at: when.includes("T") ? when : `${when}T00:00:00.000Z`,
    running_balance: running,
    bank_reference: ref,
    source: "bank",
  };
}

export function mergeTransactionLists(
  bankRows: Transaction[],
  local: Transaction[],
): Transaction[] {
  const byId = new Map<string, Transaction>();
  for (const t of bankRows) byId.set(t.id, t);
  for (const t of local) {
    if (!byId.has(t.id)) byId.set(t.id, t);
  }
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
