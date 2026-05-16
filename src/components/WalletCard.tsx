"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import type { Wallet } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function WalletCard({
  wallet,
  inflowToday = 1840,
}: {
  wallet: Wallet;
  inflowToday?: number;
}) {
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-[var(--mf-neon)]/25 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
            Smart wallet
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {formatCurrency(
              wallet.balance,
              wallet.currency || "USD",
              wallet.currency === "LKR" ? "en-LK" : "en-US",
            )}
          </p>
          <p className="mt-1 text-sm text-white/60">
            {wallet.currency} · escrow-ready for verified care teams
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--mf-neon)]">
          <WalletIcon className="h-6 w-6" />
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4"
        >
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-100/90">
            <ArrowDownLeft className="h-3.5 w-3.5" />
            Inflow (24h)
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            +{formatCurrency(inflowToday, wallet.currency || "USD", wallet.currency === "LKR" ? "en-LK" : "en-US")}
          </p>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4"
        >
          <p className="flex items-center gap-2 text-xs font-medium text-cyan-100/90">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Out to hospitals
          </p>
          <p className="mt-2 text-xl font-semibold text-white">Live</p>
        </motion.div>
      </div>
    </GlassCard>
  );
}
