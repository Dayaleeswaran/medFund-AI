"use client";

import { motion } from "framer-motion";
import { Building2, Coins } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { formatCurrency } from "@/lib/utils";
import { useCampaignStore } from "@/store/campaign-store";

export function HospitalDashboard() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const settlements = campaigns
    .filter((c) => c.verification_status === "approved")
    .slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="bg-white/55">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-sky-700" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-800/70">
                Incoming settlements
              </p>
              <h3 className="text-lg font-semibold text-[var(--mf-navy)]">
                Verified campaigns routed to your institution
              </h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {settlements.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/35 bg-white/55 px-4 py-3 text-sm text-[var(--mf-navy)]"
              >
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-[var(--mf-ink)]/65">{c.patient_name}</p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-900">
                  {formatCurrency(c.raised_amount)} escrow (demo)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/wallet" className="inline-block">
              <GlowButton type="button">Wallet & payout rails</GlowButton>
            </Link>
            <Link href="/admin" className="inline-block">
              <button
                type="button"
                className="h-14 rounded-full border border-[var(--mf-navy)]/15 bg-white/70 px-8 text-sm font-semibold text-[var(--mf-navy)] shadow-sm backdrop-blur-md transition hover:border-[var(--mf-neon)]/50"
              >
                Open Approvals Portal
              </button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <GlassCard className="h-full bg-gradient-to-br from-sky-50/60 to-white/55">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-cyan-700" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-900/70">
              Payout records
            </p>
          </div>
          <p className="mt-4 text-sm text-[var(--mf-ink)]/75">
            Seylan sandbox postings write immutable references into{" "}
            <code className="rounded bg-black/5 px-1">campaign_transparency_entries</code>{" "}
            once wired to production banking cores.
          </p>
          <ul className="mt-6 space-y-3 text-xs text-[var(--mf-navy)]">
            <li className="rounded-xl border border-white/40 bg-white/50 px-3 py-2">
              Internal transfer mock · REF‑INT‑88421 · completed
            </li>
            <li className="rounded-xl border border-white/40 bg-white/50 px-3 py-2">
              CEFTS sweep · REF‑CEFTS‑99102 · processing
            </li>
          </ul>
        </GlassCard>
      </motion.div>
    </div>
  );
}
