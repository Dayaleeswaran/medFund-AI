"use client";

import * as React from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function AnimatedProgressBar({
  value,
  className,
}: {
  /** 0–100 */
  value: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 20 });

  useEffect(() => {
    mv.set(Math.min(100, Math.max(0, value)));
  }, [value, mv]);

  const [display, setDisplay] = React.useState(0);
  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsub();
  }, [spring]);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Progress value={display} className="h-3" />
      <div className="flex justify-end text-xs font-medium text-[var(--mf-neon)]">
        {display}%
      </div>
    </div>
  );
}
