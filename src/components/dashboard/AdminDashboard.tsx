"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { AlertTriangle, Shield } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { useCampaignStore } from "@/store/campaign-store";

export function AdminDashboard() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const pending = campaigns.filter(
    (c) =>
      c.verification_status === "pending_hospital" ||
      c.verification_status === "pending_admin",
  );
  const fraudBuckets = campaigns.map((c) => ({
    name: c.patient_name.split(" ")[0] ?? c.title.slice(0, 8),
    risk: c.fraud_score,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <motion.div
        className="lg:col-span-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="bg-white/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-800/70">
                  Fraud monitoring
                </p>
                <h3 className="text-lg font-semibold text-[var(--mf-navy)]">
                  Campaign risk surface
                </h3>
              </div>
            </div>
            <Link href="/admin">
              <GlowButton type="button">Open approvals</GlowButton>
            </Link>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudBuckets}>
                <CartesianGrid strokeDasharray="4 8" stroke="#071a2c12" />
                <XAxis dataKey="name" stroke="#071a2c55" fontSize={11} />
                <YAxis stroke="#071a2c55" fontSize={11} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value ?? 0)}%`,
                    "AI fraud score",
                  ]}
                  contentStyle={{ borderRadius: 16 }}
                />
                <Bar dataKey="risk" fill="#34ff9a" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <GlassCard className="h-full border-amber-200/40 bg-amber-50/35">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-900/70">
              Queue
            </p>
          </div>
          <p className="mt-3 text-3xl font-semibold text-[var(--mf-navy)]">
            {pending.length}
          </p>
          <p className="mt-1 text-sm text-[var(--mf-ink)]/70">
            Campaigns awaiting verification or payout approval.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-[var(--mf-navy)]">
            {pending.slice(0, 4).map((c) => (
              <li key={c.id} className="rounded-xl bg-white/60 px-3 py-2">
                {c.title}
              </li>
            ))}
          </ul>
        </GlassCard>
      </motion.div>
    </div>
  );
}
