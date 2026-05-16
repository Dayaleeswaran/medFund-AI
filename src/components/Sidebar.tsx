"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  LayoutDashboard,
  Mic,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Activity },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/admin", label: "Hospital", icon: ShieldCheck },
  { href: "/voice-assistant", label: "Voice AI", icon: Mic },
];

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex w-full flex-col gap-2 rounded-[30px] border border-white/15 bg-white/[0.06] p-4 backdrop-blur-2xl lg:w-64",
        className,
      )}
    >
      <div className="mb-4 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
          Navigate
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={href}
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[var(--mf-neon)] shadow-inner group-hover:bg-[var(--mf-neon)]/15">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          </motion.div>
        ))}
      </nav>
    </aside>
  );
}
