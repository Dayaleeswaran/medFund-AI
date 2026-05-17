import { create } from "zustand";
import type { Transaction, Wallet } from "@/types";
import { createClient } from "@/lib/supabase/client";

type WalletState = {
  wallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  fetchWalletData: (userId: string) => Promise<void>;
  credit: (amount: number, description: string, campaignId?: string | null) => Promise<void>;
  debit: (amount: number, description: string, campaignId?: string | null) => Promise<void>;
  updateWallet: (wallet: Wallet) => void;
  addTransaction: (tx: Transaction) => void;
  syncBankFeed: (args: { balance: number; currency?: string; bankTransactions: Transaction[] }) => Promise<void>;
};

const supabase = createClient();

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  transactions: [],
  loading: false,
  fetchWalletData: async (userId) => {
    if (!supabase) return;
    set({ loading: true });
    
    // Fetch Wallet
    let { data: wData } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    // Auto-create wallet if missing (for migration)
    if (!wData) {
      const { data: newW, error } = await supabase
        .from("wallets")
        .insert({ user_id: userId, balance: 0, currency: "LKR" })
        .select("*")
        .single();
      if (!error) wData = newW;
    }
    
    if (wData) {
      set({ wallet: wData as Wallet });
      
      // Fetch Transactions
      const { data: tData } = await supabase
        .from("transactions")
        .select("*")
        .eq("wallet_id", wData.id)
        .order("created_at", { ascending: false });
      
      if (tData) {
        set({ transactions: tData as Transaction[] });
      }
    }
    set({ loading: false });
  },
  credit: async (amount, description, campaignId = null) => {
    const { wallet, transactions } = get();
    if (!wallet || !supabase) return;

    const newBalance = wallet.balance + amount;
    const tx: Transaction = {
      id: crypto.randomUUID(),
      wallet_id: wallet.id,
      type: "inflow",
      amount,
      description,
      campaign_id: campaignId,
      created_at: new Date().toISOString(),
    };

    // Optimistic Update
    set({ 
      wallet: { ...wallet, balance: newBalance },
      transactions: [tx, ...transactions]
    });

    await Promise.all([
      supabase.from("wallets").update({ balance: newBalance }).eq("id", wallet.id),
      supabase.from("transactions").insert(tx)
    ]);
  },
  debit: async (amount, description, campaignId = null) => {
    const { wallet, transactions } = get();
    if (!wallet || !supabase) return;

    const newBalance = Math.max(0, wallet.balance - amount);
    const tx: Transaction = {
      id: crypto.randomUUID(),
      wallet_id: wallet.id,
      type: "outflow",
      amount,
      description,
      campaign_id: campaignId,
      created_at: new Date().toISOString(),
    };

    // Optimistic Update
    set({ 
      wallet: { ...wallet, balance: newBalance },
      transactions: [tx, ...transactions]
    });

    await Promise.all([
      supabase.from("wallets").update({ balance: newBalance }).eq("id", wallet.id),
      supabase.from("transactions").insert(tx)
    ]);
  },
  updateWallet: (wallet) => set({ wallet }),
  addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
  syncBankFeed: async ({ balance, currency, bankTransactions }) => {
    const { wallet, transactions } = get();
    if (!wallet || !supabase) return;

    const nextWallet = { ...wallet, balance, currency: currency ?? wallet.currency };
    
    // Update local state
    set({ wallet: nextWallet, transactions: bankTransactions });

    // Persist to DB
    await supabase.from("wallets").update({ balance, currency: nextWallet.currency }).eq("id", wallet.id);
    // Note: In a real app we'd upsert transactions, but for now we just refresh from the feed
  },
}));
