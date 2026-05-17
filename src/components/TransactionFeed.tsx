"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react";
import type { Transaction } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionFeed({
  items,
  currency = "LKR",
}: {
  items: Transaction[];
  currency?: string;
}) {
  const locale = currency === "LKR" ? "en-LK" : "en-US";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/55">
        <Clock3 className="h-3.5 w-3.5" />
        Live timeline
      </div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md",
              t.type === "inflow"
                ? "shadow-[0_0_20px_rgba(52,255,154,0.08)]"
                : "shadow-[0_0_16px_rgba(0,200,255,0.06)]",
            )}
          >
            <div className="flex gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl",
                  t.type === "inflow"
                    ? "bg-emerald-500/15 text-emerald-200"
                    : "bg-cyan-500/15 text-cyan-200",
                )}
              >
                {t.type === "inflow" ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    {t.description || "Movement"}
                  </p>
                  {t.source === "bank" ? (
                    <span className="rounded-full bg-[var(--mf-neon)]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--mf-neon)]">
                      Core bank
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-white/50">{formatTime(t.created_at)}</p>
                {t.bank_reference ? (
                  <p className="mt-0.5 font-mono text-[10px] text-white/40">
                    {t.bank_reference}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  t.type === "inflow"
                    ? "text-[var(--mf-neon)]"
                    : "text-cyan-200",
                )}
              >
                {t.type === "inflow" ? "+" : "-"}
                {formatCurrency(t.amount, currency, locale)}
              </p>
              {t.running_balance != null ? (
                <p className="mt-1 text-[10px] text-white/45">
                  Bal {formatCurrency(t.running_balance, currency, locale)}
                </p>
              ) : null}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
