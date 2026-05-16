"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, HeartPulse, ShieldCheck, Users } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import type { Campaign } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

export function CampaignCard({
  campaign,
  index = 0,
}: {
  campaign: Campaign;
  index?: number;
}) {
  const pct = Math.min(
    100,
    Math.round((campaign.raised_amount / campaign.target_amount) * 100),
  );
  const urgent =
    campaign.urgency === "critical"
      ? "bg-red-500/90 text-white"
      : campaign.urgency === "high"
        ? "bg-amber-400/90 text-[#1a1200]"
        : "bg-cyan-500/80 text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <GlassCard className="group relative flex h-full flex-col gap-4 overflow-hidden glow">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--mf-neon)]/20 blur-3xl" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-200/80">
              {campaign.hospital_name}
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
              {campaign.title}
            </h3>
            <p className="mt-1 text-sm text-white/65">
              For{" "}
              <span className="font-medium text-white">{campaign.patient_name}</span>
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide",
              urgent,
            )}
          >
            {campaign.urgency}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1",
              campaign.verification_status === "verified"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                : campaign.verification_status === "pending"
                  ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                  : "border-red-400/40 bg-red-500/10 text-red-100",
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {campaign.verification_status}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/75">
            <Users className="h-3.5 w-3.5 text-[var(--mf-neon)]" />
            {campaign.donor_count.toLocaleString()} live donors
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
            <HeartPulse className="h-3.5 w-3.5 text-cyan-300" />
            AI risk {Math.round(campaign.fraud_score)} / 100
          </span>
        </div>

        <AnimatedProgressBar value={pct} />

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-white/55">Raised</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(campaign.raised_amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/55">Goal</p>
            <p className="text-lg font-semibold text-white/90">
              {formatCurrency(campaign.target_amount)}
            </p>
          </div>
        </div>

        <Link
          href={`/campaign/${campaign.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white transition group-hover:border-[var(--mf-neon)]/50 group-hover:bg-[var(--mf-neon)]/10"
        >
          Open emergency room
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </GlassCard>
    </motion.div>
  );
}
