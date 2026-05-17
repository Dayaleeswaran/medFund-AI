"use client";

import { motion } from "framer-motion";
import { Activity, HeartPulse, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { DonorDashboard } from "@/components/dashboard/DonorDashboard";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { HospitalDashboard } from "@/components/dashboard/HospitalDashboard";
import { useCampaignStore } from "@/store/campaign-store";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, formatCompact } from "@/lib/utils";
import type { UserRole } from "@/types";

export default function DashboardPage() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const role: UserRole = useAuthStore((s) => s.user?.role) ?? "donator";

  const totalRaised = campaigns.reduce((a, c) => a + c.raised_amount, 0);
  const active = campaigns.filter((c) => c.status === "active").length;

  const statCards = [
    {
      label: "Capital routed",
      value: formatCurrency(totalRaised),
      icon: Activity,
      tone: "from-cyan-400/30 to-[var(--mf-neon)]/20",
    },
    {
      label: "Live emergencies",
      value: String(active),
      icon: HeartPulse,
      tone: "from-rose-400/25 to-orange-300/10",
    },
    {
      label: "AI reviews / hr",
      value: "148",
      icon: Shield,
      tone: "from-emerald-400/25 to-cyan-300/15",
    },
    {
      label: "Avg. donor velocity",
      value: `${formatCompact(totalRaised / 12 || 0)}/m`,
      icon: Zap,
      tone: "from-indigo-400/20 to-cyan-200/15",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
            Command center ·{" "}
            <span className="text-white/90 capitalize">{role}</span>
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Every second counts. Your capital stack is live.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-cyan-50/85">
            MedFund AI couples hospital attestations with AI fraud rails and
            banking-grade wallets so donors see exactly where relief lands.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/campaigns">
            <GlowButton type="button">View live emergencies</GlowButton>
          </Link>
          <Link href="/wallet">
            <button
              type="button"
              className="h-14 rounded-full border border-[var(--mf-navy)]/15 bg-white/70 px-8 text-sm font-semibold text-[var(--mf-navy)] shadow-sm backdrop-blur-md transition hover:border-[var(--mf-neon)]/50"
            >
              Open wallet
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard
                className={`relative bg-gradient-to-br ${s.tone}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-[var(--mf-navy)]/55">
                      {s.label}
                    </p>
                    <p className="mt-2 truncate text-2xl font-semibold text-[var(--mf-navy)]">
                      {s.value}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/40 text-[var(--mf-navy)] shadow-inner">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {role === "donator" ? <DonorDashboard /> : null}
      {role === "fund_raiser" ? <PatientDashboard /> : null}
      {role === "admin" ? <AdminDashboard /> : null}
      {role === "hospital" ? <HospitalDashboard /> : null}

      <GlassCard className="bg-white/55">
        <h2 className="text-lg font-semibold text-[var(--mf-navy)]">
          Launch or amplify an emergency fundraiser
        </h2>
        <p className="mt-1 text-sm text-[var(--mf-ink)]/70">
          Production flows attach Supabase rows, Seylan postings, and QR deep
          links. Continue from{" "}
          <Link className="font-semibold text-cyan-700 underline" href="/campaigns">
            Campaigns
          </Link>{" "}
          or voice onboarding.
        </p>
      </GlassCard>
    </div>
  );
}
