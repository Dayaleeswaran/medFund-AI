"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { useWalletStore } from "@/store/wallet-store";
import {
  fintechGetBalance,
  fintechGetHistory,
  fintechHealth,
} from "@/services/fintech-gateway";
import { useFintechEventsStore } from "@/store/fintech-events-store";

export function WalletFintechSync() {
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const push = useFintechEventsStore((s) => s.push);

  async function refresh() {
    setLoading(true);
    try {
      const health = await fintechHealth();
      setConfigured(health.configured);
      if (!health.configured) {
        toast.error("Add FINTECH_BASE_URL and FINTECH_API_KEY to .env.local");
        return;
      }
      const w = useWalletStore.getState().wallet;
      const bal = await fintechGetBalance();
      const hist = await fintechGetHistory({ walletId: w.id });
      const balance = bal.available ?? bal.ledger ?? w.balance;
      useWalletStore.getState().syncBankFeed({
        balance,
        currency: bal.currency ?? "LKR",
        bankTransactions: hist.transactions,
      });
      push({ kind: "balance_poll", detail: "wallet sync" });
      toast.success("Ledger synced");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      const h = await fintechHealth();
      setConfigured(h.configured);
      if (h.configured) await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <GlassCard className="flex flex-col gap-3 bg-white/60 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mf-ink)]/55">
          Core banking
        </p>
        <p className="mt-1 text-sm text-[var(--mf-navy)]">
          {configured === false
            ? "Not configured — set env keys for live sandbox."
            : "GetAccountBalance + GetAccountTransactions merged into your wallet."}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={loading || configured === false}
        className="gap-2 border-[var(--mf-navy)]/12 text-[var(--mf-navy)]"
        onClick={() => void refresh()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Refresh ledger
      </Button>
    </GlassCard>
  );
}
