import "server-only";
import { getFintechConfig } from "@/lib/fintech/config";
import { fintechRequest } from "@/lib/fintech/client";

export async function initiateCeftsTransfer(params: {
  amount: number;
  beneficiaryAccountNumber: string;
  beneficiaryBankCode: string;
  transactionReference: string;
  remarks?: string;
  sourceAccountNumber?: string;
}) {
  const cfg = getFintechConfig();
  const body: Record<string, unknown> = {
    SourceAccountNumber:
      params.sourceAccountNumber ?? cfg.internalDestAccount,
    BeneficiaryAccountNumber: params.beneficiaryAccountNumber,
    BeneficiaryBankCode: params.beneficiaryBankCode,
    TransferAmount: params.amount,
    CurrencyCode: cfg.currencyCode,
    TransactionReference: params.transactionReference,
    Remarks: params.remarks ?? "MediFund hospital payout",
  };

  return fintechRequest("POST", cfg.ceftsPath, { body });
}
