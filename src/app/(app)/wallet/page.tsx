"use client";

import { WalletCard } from "@/components/WalletCard";
import { TransactionFeed } from "@/components/TransactionFeed";
import { GlassCard } from "@/components/GlassCard";
import { useWalletStore } from "@/store/wallet-store";
import { WalletFintechSync } from "@/components/WalletFintechSync";
import { JustPayPanel } from "@/components/JustPayPanel";

export default function WalletPage() {
  const wallet = useWalletStore((s) => s.wallet);
  const transactions = useWalletStore((s) => s.transactions);

  if (!wallet) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-white/60">Loading smart wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
          Smart wallet
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Live ledger + core banking (sandbox)
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-cyan-50/85">
          Balances and rails sync from GetAccountBalance / GetAccountTransactions.
          Donations post InternalTransfer server-side; payouts use CEFTS.
        </p>
      </div>

      <WalletFintechSync />
      <WalletCard wallet={wallet} />

      <GlassCard className="bg-[#061f36]/90 text-white">
        <TransactionFeed
          items={transactions}
          currency={wallet.currency ?? "LKR"}
        />
      </GlassCard>

      <JustPayPanel />
    </div>
  );
}
