import { create } from "zustand";
import type { Transaction, Wallet } from "@/types";
import { mergeTransactionLists } from "@/lib/fintech/parsers";
import { MOCK_TRANSACTIONS, MOCK_WALLET } from "@/lib/mock-data";

type WalletState = {
  wallet: Wallet;
  transactions: Transaction[];
  setWallet: (w: Wallet) => void;
  addTransaction: (t: Transaction) => void;
  credit: (
    amount: number,
    description: string,
    campaignId?: string | null,
  ) => void;
  debit: (
    amount: number,
    description: string,
    campaignId?: string | null,
  ) => void;
  syncBankFeed: (args: {
    balance: number;
    currency?: string;
    bankTransactions: Transaction[];
  }) => void;
  setTransactions: (transactions: Transaction[]) => void;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: MOCK_WALLET,
  transactions: MOCK_TRANSACTIONS,
  setWallet: (wallet) => set({ wallet }),
  addTransaction: (t) =>
    set((s) => ({ transactions: [t, ...s.transactions] })),
  credit: (amount, description, campaignId = null) => {
    const { wallet } = get();
    const next: Wallet = {
      ...wallet,
      balance: wallet.balance + amount,
      updated_at: new Date().toISOString(),
    };
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      wallet_id: wallet.id,
      type: "inflow",
      amount,
      description,
      campaign_id: campaignId,
      created_at: new Date().toISOString(),
      source: "ledger",
    };
    set({ wallet: next, transactions: [tx, ...get().transactions] });
  },
  debit: (amount, description, campaignId = null) => {
    const { wallet } = get();
    const next: Wallet = {
      ...wallet,
      balance: Math.max(0, wallet.balance - amount),
      updated_at: new Date().toISOString(),
    };
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      wallet_id: wallet.id,
      type: "outflow",
      amount,
      description,
      campaign_id: campaignId,
      created_at: new Date().toISOString(),
      source: "ledger",
    };
    set({ wallet: next, transactions: [tx, ...get().transactions] });
  },
  syncBankFeed: ({ balance, currency, bankTransactions }) => {
    const { wallet, transactions } = get();
    const nextWallet: Wallet = {
      ...wallet,
      balance,
      currency: currency ?? wallet.currency,
      updated_at: new Date().toISOString(),
    };
    const merged = mergeTransactionLists(bankTransactions, transactions);
    set({ wallet: nextWallet, transactions: merged });
  },
  setTransactions: (transactions) => set({ transactions }),
}));
