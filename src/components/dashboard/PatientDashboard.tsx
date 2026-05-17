"use client";

import { motion } from "framer-motion";
import { Activity, Landmark, PiggyBank } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { formatCurrency } from "@/lib/utils";
import { useCampaignStore } from "@/store/campaign-store";
import { useAuthStore } from "@/store/auth-store";
import { useWalletStore } from "@/store/wallet-store";
import { CampaignQrCode } from "@/components/CampaignQrCode";
import { DonationChart } from "@/components/DonationChart";

export function PatientDashboard() {
  const userId = useAuthStore((s) => s.user?.id);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const walletTransactions = useWalletStore((s) => s.transactions);
  const mine = campaigns.filter(
    (c) => c.user_id === userId || userId?.startsWith("demo"),
  );
  const primary = mine[0] ?? campaigns[0];

  if (!primary) {
    return (
      <GlassCard className="bg-white/55">
        <p className="text-sm text-[var(--mf-ink)]/75">
          No campaigns linked yet. Launch one from{" "}
          <Link href="/campaigns" className="font-semibold text-cyan-700 underline">
            Campaigns
          </Link>
          .
        </p>
      </GlassCard>
    );
  }

  const pct = Math.min(
    100,
    Math.round((primary.raised_amount / primary.target_amount) * 100),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <motion.div
        className="lg:col-span-2 space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="bg-white/55">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-700/80">
                Active fundraiser
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--mf-navy)]">
                {primary.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--mf-ink)]/70">
                {primary.hospital_name} · {primary.verification_status} verification
              </p>
            </div>
            <div className="flex gap-2">
              <CampaignQrCode campaignId={primary.id} title={primary.title} />
              <Link href={`/campaign/${primary.id}`}>
                <GlowButton type="button">Public campaign page</GlowButton>
              </Link>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between text-sm font-medium text-[var(--mf-navy)]">
              <span>{formatCurrency(primary.raised_amount)} raised</span>
              <span>{formatCurrency(primary.target_amount)} goal</span>
            </div>
            <AnimatedProgressBar value={pct} className="mt-3" />
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-emerald-50/50 to-white/60">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-emerald-700" />
            <div>
              <h4 className="font-semibold text-[var(--mf-navy)]">
                Hospital payouts
              </h4>
              <p className="text-xs text-[var(--mf-ink)]/65">
                Settlement rails mirror Seylan sandbox postings — funds release after
                verification + fraud clearance.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-[var(--mf-navy)]/50">
                Next transfer
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--mf-navy)]">
                Scheduled (demo)
              </p>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-[var(--mf-navy)]/50">
                Donor velocity
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--mf-navy)]">
                {primary.donor_count.toLocaleString()} donors
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <GlassCard className="h-full bg-white/45">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-600" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-800/70">
                Velocity (7d)
              </p>
            </div>
          </div>
          <div className="mt-4">
            <DonationChart transactions={walletTransactions} type="inflow" />
          </div>
          <ul className="mt-4 space-y-4 text-sm text-[var(--mf-navy)]">
            <li className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
              Median gift trending ↑ after QR placements.
            </li>
            <li className="text-[var(--mf-ink)]/70">
              Fraud score held at{" "}
              <span className="font-semibold text-[var(--mf-navy)]">
                {primary.fraud_score}%
              </span>{" "}
              — AI narration boosts trust without exposing PHI.
            </li>
          </ul>
        </GlassCard>
      </motion.div>
    </div>
  );
}
