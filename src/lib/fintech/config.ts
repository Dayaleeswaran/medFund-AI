import "server-only";

export type FintechConfig = {
  baseUrl: string;
  apiKey: string;
  /** Sandbox “team key” header — defaults to FINTECH_TEAM_KEY or same as apiKey. */
  teamKey: string;
  teamKeyHeader: string;
  qrGeneratePath: string;
  sourceAccount: string;
  internalDestAccount: string;
  balanceAccount: string;
  currencyCode: string;
  timeoutMs: number;
  justPay: {
    registerPath: string;
    verifyPath: string;
    payPath: string;
    statusPath: string;
  };
  ceftsPath: string;
  internalTransferPath: string;
  balancePath: string;
  transactionsPath: string;
  ipg: {
    merchantId: string;
    operatorId: string;
    password: string;
    checkoutUrl: string;
  };
};

export class FintechConfigError extends Error {
  constructor(message = "FINTECH_BASE_URL and FINTECH_API_KEY must be set") {
    super(message);
    this.name = "FintechConfigError";
  }
}

export function getFintechConfig(): FintechConfig {
  const baseUrl = process.env.FINTECH_BASE_URL?.trim() ?? "";
  const apiKey = process.env.FINTECH_API_KEY?.trim() ?? "";
  if (!baseUrl || !apiKey) {
    throw new FintechConfigError();
  }
  const teamKey =
    process.env.FINTECH_TEAM_KEY?.trim() || apiKey;
  const teamKeyHeader =
    process.env.FINTECH_TEAM_KEY_HEADER?.trim() || "X-Team-Key";

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
    teamKey,
    teamKeyHeader,
    qrGeneratePath:
      process.env.FINTECH_QR_GENERATE_PATH?.trim() ??
      "/Posting/Payments/Qr/1.0/GenerateQrPayment",
    sourceAccount:
      process.env.FINTECH_SOURCE_ACCOUNT?.trim() ?? "064000012548001",
    internalDestAccount:
      process.env.FINTECH_INTERNAL_DEST_ACCOUNT?.trim() ?? "001213437904100",
    balanceAccount:
      process.env.FINTECH_BALANCE_ACCOUNT?.trim() ??
      process.env.FINTECH_INTERNAL_DEST_ACCOUNT?.trim() ??
      "001213437904100",
    currencyCode: process.env.FINTECH_CURRENCY_CODE?.trim() ?? "LKR",
    timeoutMs: Math.min(
      60_000,
      Math.max(5_000, Number(process.env.FINTECH_TIMEOUT_MS ?? 28_000)),
    ),
    justPay: {
      registerPath:
        process.env.FINTECH_JUSTPAY_REGISTER_PATH?.trim() ??
        "/Posting/Account/JustPay/1.0/JustPayRegisterAccount",
      verifyPath:
        process.env.FINTECH_JUSTPAY_VERIFY_PATH?.trim() ??
        "/Posting/Account/JustPay/1.0/VerifyJustPayRegistration",
      payPath:
        process.env.FINTECH_JUSTPAY_PAY_PATH?.trim() ??
        "/Posting/Account/JustPay/1.0/InitiateJustPayTransaction",
      statusPath:
        process.env.FINTECH_JUSTPAY_STATUS_PATH?.trim() ??
        "/Inquiry/Account/JustPay/1.0/GetJustPayTransactionStatus",
    },
    ceftsPath:
      process.env.FINTECH_CEFTS_PATH?.trim() ??
      "/Posting/Account/Cefts/1.0/InitiateCEFTSTransfer",
    internalTransferPath:
      process.env.FINTECH_INTERNAL_TRANSFER_PATH?.trim() ??
      "/Posting/Account/InternalTransfer/1.0/TransferFunds",
    balancePath:
      process.env.FINTECH_BALANCE_PATH?.trim() ??
      "/Inquiry/Account/AccountInquiry/1.0/GetAccountBalance",
    transactionsPath:
      process.env.FINTECH_TRANSACTIONS_PATH?.trim() ??
      "/Inquiry/Account/AccountInquiry/1.0/GetAccountTransactions",
    ipg: {
      merchantId: process.env.SEYLAN_IPG_MERCHANT_ID?.trim() ?? "",
      operatorId: process.env.SEYLAN_IPG_OPERATOR_ID?.trim() ?? "",
      password: process.env.SEYLAN_IPG_PASSWORD?.trim() ?? "",
      checkoutUrl:
        process.env.SEYLAN_IPG_CHECKOUT_URL?.trim() ??
        "https://seylan.gateway.mastercard.com/api/page/version/57/pay",
    },
  };
}

export function isFintechConfigured(): boolean {
  return Boolean(
    process.env.FINTECH_BASE_URL?.trim() && process.env.FINTECH_API_KEY?.trim(),
  );
}
