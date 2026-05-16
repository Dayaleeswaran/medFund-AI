import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-x-hidden bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(64,224,208,0.18),transparent_55%),radial-gradient(900px_500px_at_0%_0%,rgba(52,255,154,0.12),transparent_50%),linear-gradient(180deg,#051a31,#0a2648_40%,#e8f4ff)] text-[var(--mf-ink)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none absolute -left-32 top-40 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[var(--mf-neon)]/25 blur-3xl" />
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
