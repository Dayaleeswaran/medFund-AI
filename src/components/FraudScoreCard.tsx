"use client";

import { AlertTriangle, Shield, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";

export function FraudScoreCard({
  fraudScore,
  trustScore,
  alerts,
  className,
}: {
  fraudScore: number;
  trustScore: number;
  alerts: string[];
  className?: string;
}) {
  const safe = fraudScore < 22;
  return (
    <GlassCard className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--mf-neon)]">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60">
            AI transparency
          </p>
          <p className="text-lg font-semibold text-white">Fraud + trust</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/55">
            Risk score
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold",
              safe ? "text-emerald-300" : "text-amber-300",
            )}
          >
            {fraudScore}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/55">
            Trust score
          </p>
          <p className="mt-1 text-2xl font-bold text-cyan-200">{trustScore}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {alerts.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-emerald-200/90">
            <Shield className="h-4 w-4" />
            No elevated alerts. Escrow pacing normal.
          </p>
        ) : (
          alerts.map((a) => (
            <p
              key={a}
              className="flex gap-2 text-sm text-amber-100/90 leading-snug"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              {a}
            </p>
          ))
        )}
      </div>
    </GlassCard>
  );
}
