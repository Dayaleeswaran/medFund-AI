import "server-only";
import { getFintechConfig } from "@/lib/fintech/config";
import { fintechRequest } from "@/lib/fintech/client";

/** Internal sandbox transfer (donations → escrow / destination account). Body uses PascalCase for typical banking gateways. */
export async function transferFundsInternal(params: {
  amount: number;
  transactionReference: string;
  narration?: string;
  sourceAccountNumber?: string;
  destinationAccountNumber?: string;
}) {
  const cfg = getFintechConfig();
  const body: Record<string, unknown> = {
    SourceAccountNumber:
      params.sourceAccountNumber ?? cfg.sourceAccount,
    DestinationAccountNumber:
      params.destinationAccountNumber ?? cfg.internalDestAccount,
    TransferAmount: params.amount,
    CurrencyCode: cfg.currencyCode,
    TransactionReference: params.transactionReference,
    Narration: params.narration ?? "MediFund donation",
  };

  return fintechRequest("POST", cfg.internalTransferPath, { body });
}
