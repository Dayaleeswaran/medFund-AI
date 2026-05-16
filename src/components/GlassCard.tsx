import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  glow,
}: {
  className?: string;
  children: React.ReactNode;
  /** subtle green rim glow */
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-white/20 bg-white/[0.08] p-6 shadow-[0_8px_40px_rgba(2,24,40,0.35)] backdrop-blur-xl",
        glow &&
          "shadow-[0_0_40px_rgba(52,255,154,0.12),0_8px_40px_rgba(2,24,40,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
