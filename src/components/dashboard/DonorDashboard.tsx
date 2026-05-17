"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Heart, Sparkles, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { useWalletStore } from "@/store/wallet-store";
import { useCampaignStore } from "@/store/campaign-store";
import { DonationChart } from "@/components/DonationChart";

export function DonorDashboard() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const walletTransactions = useWalletStore((s) => s.transactions);
  
  const favorites = [...campaigns]
    .sort((a, b) => b.trust_score - a.trust_score)
    .slice(0, 3);
  const totalImpact = walletTransactions
    .filter(t => t.type === "outflow")
    .reduce((a, t) => a + t.amount, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <motion.div
        className="lg:col-span-2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="bg-white/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-700/80">
                Impact pulse
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[var(--mf-navy)]">
                Donations routed
              </h3>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-900">
              <TrendingUp className="h-3.5 w-3.5" />
              {formatCurrency(totalImpact)} total volume
            </span>
          </div>
          <div className="mt-6 h-64 w-full">
             <DonationChart transactions={walletTransactions} type="outflow" />
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <GlassCard className="h-full bg-gradient-to-br from-white/65 to-cyan-50/40">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-600" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-800/70">
              Favorite emergencies
            </p>
          </div>
          <ul className="mt-4 space-y-3">
            {favorites.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-white/40 bg-white/50 px-3 py-3 text-sm shadow-sm backdrop-blur-md"
              >
                <div className="flex items-start gap-2">
                  <Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-semibold text-[var(--mf-navy)]">{c.title}</p>
                    <p className="text-xs text-[var(--mf-ink)]/65">{c.hospital_name}</p>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      {formatCurrency(c.raised_amount)} raised ·{" "}
                      <span className="font-medium">{c.trust_score}% trust</span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </motion.div>
    </div>
  );
}
