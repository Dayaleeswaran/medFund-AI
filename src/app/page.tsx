"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Building2,
  Lock,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { CampaignCard } from "@/components/CampaignCard";
import { useCampaignStore } from "@/store/campaign-store";
import { TRUSTED_HOSPITALS } from "@/lib/mock-data";
import { formatCurrency, formatCompact } from "@/lib/utils";

function LiveStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <GlassCard className="bg-white/55 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--mf-ink)]/55">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[var(--mf-navy)]">{value}</p>
    </GlassCard>
  );
}

function AnimatedHeroNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 18 });
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  React.useEffect(() => {
    const u = spring.on("change", (v) => setDisplay(Math.round(v)));
    return () => u();
  }, [spring]);
  return (
    <span className="tabular-nums">
      {formatCurrency(display)}
    </span>
  );
}

export default function HomePage() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const approved = campaigns.filter((c) => c.verification_status === "approved");
  const top = [...approved]
    .sort((a, b) => b.raised_amount - a.raised_amount)
    .slice(0, 3);
  const totalRaised = approved.reduce((a, c) => a + c.raised_amount, 0);

  return (
    <div className="space-y-20 pb-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--mf-navy)]/10 bg-white/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--mf-navy)] shadow-sm backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--mf-neon)]" />
            AI + fintech for critical care
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
          >
            Emergency crowdfunding with hospital-grade trust,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              instant wallet rails
            </span>
            , and an AI that never sleeps.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-xl text-base text-cyan-50/85"
          >
            MediFund AI routes lifesaving donations like Revolut routes FX —
            with transparent ledgers, live fraud scoring, and voice-guided flows
            for families under shock.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link href="/campaigns">
              <GlowButton type="button" className="w-full sm:w-auto">
                Donate now
              </GlowButton>
            </Link>
            <Link href="/signup">
              <button
                type="button"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[var(--mf-navy)]/14 bg-white/80 px-8 text-sm font-semibold text-[var(--mf-navy)] backdrop-blur-md transition hover:border-[var(--mf-neon)]/60 sm:w-auto"
              >
                Create fundraiser
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
          <div className="mt-10 grid grid-cols-3 gap-3">
            <LiveStat
              label="Routed (demo pool)"
              value={<AnimatedHeroNumber value={totalRaised} />}
            />
            <LiveStat label="Verified hospitals" value="48" />
            <LiveStat label="Median payout" value="6m 12s" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 120 }}
          className="relative"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-br from-cyan-200/60 via-white/20 to-[var(--mf-neon)]/40 blur-2xl" />
          <GlassCard className="space-y-4 border-[var(--mf-navy)]/10 bg-white/65 shadow-[0_24px_80px_rgba(8,47,73,0.18)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--mf-ink)]/50">
                  Live triage board
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--mf-navy)]">
                  {formatCompact(totalRaised)} in-flight
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase text-emerald-800">
                Systems nominal
              </span>
            </div>
            <div className="space-y-3">
              {top.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center justify-between rounded-2xl border border-[var(--mf-navy)]/8 bg-white/80 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--mf-navy)]">
                      {c.patient_name}
                    </p>
                    <p className="text-[11px] text-[var(--mf-ink)]/60">
                      {c.hospital_name}
                    </p>
                  </div>
                  <div className="text-right text-xs font-semibold text-emerald-700">
                    {Math.round((c.raised_amount / c.target_amount) * 100)}%
                    <span className="block text-[10px] font-normal text-[var(--mf-ink)]/50">
                      funded
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--mf-navy)]/15 bg-[var(--mf-navy)]/[0.03] py-3 text-xs font-semibold text-[var(--mf-navy)]"
            >
              Open command center
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassCard>
        </motion.div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-900/70">
              Trusted hospitals
            </p>
            <h2 className="text-2xl font-semibold text-[var(--mf-navy)]">
              Attested care networks with live verification
            </h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUSTED_HOSPITALS.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="flex items-center gap-3 bg-white/60">
                <Building2 className="h-8 w-8 text-cyan-700" />
                <div>
                  <p className="font-semibold text-[var(--mf-navy)]">{h.name}</p>
                  <p className="text-[11px] text-[var(--mf-ink)]/55">
                    {h.region} · {h.verified ? "On-chain attested" : "Pending"}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="bg-[var(--mf-navy)]/90 text-white">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-[var(--mf-neon)]" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                AI transparency
              </p>
              <h3 className="text-xl font-semibold">
                Fraud mesh + explainable trust
              </h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/75">
            Every campaign receives parallel scoring: document forensics,
            velocity anomalies, hospital domain alignment, and voice-match when
            enabled. Supporters see plain-language alerts before funds move.
          </p>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-cyan-600/90 to-[var(--mf-navy)] text-white">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-[var(--mf-neon)]" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">
                Realtime wallet
              </p>
              <h3 className="text-xl font-semibold">Apple Wallet × Revolut</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/80">
            Instant donation capture, automated hospital disbursement windows, and
            a living ledger you can export for audits — all streaming over
            Supabase realtime.
          </p>
        </GlassCard>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--mf-navy)]">
          Voices from the waiting room
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              q: "We saw funds hit the hospital wallet before I finished coffee.",
              a: "— Jordan, donor",
            },
            {
              q: "MediFund’s voice flow held my mom’s hand through setup.",
              a: "— Priya, family lead",
            },
            {
              q: "Finally, an emergency rail that doesn’t feel like sketchy social.",
              a: "— clinician attestor",
            },
          ].map((t, i) => (
            <motion.div
              key={t.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard className="h-full bg-white/65">
                <Quote className="h-5 w-5 text-[var(--mf-neon)]" />
                <p className="mt-3 text-sm text-[var(--mf-ink)]/85">{t.q}</p>
                <p className="mt-3 text-xs font-semibold text-[var(--mf-navy)]">
                  {t.a}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--mf-navy)]">
          How MediFund moves in minutes
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["1 · Voice / web intake", "AI structures the case & collects proof"],
            ["2 · Hospital attests", "Verified admins sign on-chain ledger"],
            ["3 · Donors tap in", "Wallet + card rails settle instantly"],
            ["4 · Transparent care", "Payout windows unlock with live status"],
          ].map(([title, body]) => (
            <GlassCard key={title} className="bg-white/60">
              <ShieldCheck className="h-6 w-6 text-cyan-700" />
              <p className="mt-3 text-sm font-semibold text-[var(--mf-navy)]">
                {title}
              </p>
              <p className="mt-2 text-xs text-[var(--mf-ink)]/75">{body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-[40px] bg-gradient-to-b from-[#041a30] via-[#062948] to-[#041a30] p-6 shadow-[0_40px_120px_rgba(4,26,48,0.45)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-white">Live emergencies</h2>
          <Link
            href="/campaigns"
            className="text-sm font-semibold text-[var(--mf-neon)] underline"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {top.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
