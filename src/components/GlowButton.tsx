"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
};

export function GlowButton({
  className,
  children,
  ...rest
}: GlowButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-[var(--mf-neon)] px-8 text-base font-semibold text-[#04251a] shadow-[0_0_28px_rgba(52,255,154,0.5)] transition-shadow hover:shadow-[0_0_40px_rgba(52,255,154,0.75)]",
        className,
      )}
      {...rest}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-40" />
    </motion.button>
  );
}
