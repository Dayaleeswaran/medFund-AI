"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import type { Transaction } from "@/types";

export function DonationChart({ transactions, type = "inflow" }: { transactions: Transaction[], type?: "inflow" | "outflow" }) {
  const data = useMemo(() => {
    // Generate last 7 days
    const days = Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(new Date(), 6 - i)));
    
    return days.map(day => {
      const dailyTotal = transactions
        .filter(t => t.type === type && isSameDay(new Date(t.created_at), day))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(day, "MMM dd"),
        amount: dailyTotal,
      };
    });
  }, [transactions, type]);

  const maxVal = Math.max(...data.map(d => d.amount));

  if (transactions.length === 0 || maxVal === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <p className="text-sm text-white/50">Not enough data for velocity chart.</p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--mf-neon)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--mf-neon)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#041326', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px'
            }}
            itemStyle={{ color: 'var(--mf-neon)' }}
            formatter={(val) => [`LKR ${Number(val ?? 0).toLocaleString()}`, 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--mf-neon)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
