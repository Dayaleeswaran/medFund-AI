"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCampaignStore } from "@/store/campaign-store";
import { HospitalVerificationCard } from "@/components/HospitalVerificationCard";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const campaigns = useCampaignStore((s) => s.campaigns);

  const queue = useMemo(
    () => campaigns.filter((c) => c.verification_status === "pending"),
    [campaigns],
  );

  function escalateRole() {
    if (!user) return;
    if (user.role !== "hospital" && user.role !== "admin") {
      setUser({ ...user, role: "hospital" });
      toast.success("Hospital reviewer mode enabled (demo)");
    } else {
      toast("Already a reviewer", { icon: "✓" });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
            Hospital console
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--mf-navy)] sm:text-4xl">
            Approve attestations, reject suspicious intake
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--mf-ink)]/75">
            In production this view is restricted to `hospital` and `admin`
            roles with row-level security from Supabase.
          </p>
        </div>
        <Button
          variant="secondary"
          className="rounded-2xl border-[var(--mf-navy)]/15 bg-white/70 text-[var(--mf-navy)]"
          onClick={escalateRole}
        >
          Enable reviewer demo role
        </Button>
      </div>

      {user?.role !== "hospital" && user?.role !== "admin" ? (
        <GlassCard className="bg-amber-500/15 text-[var(--mf-navy)]">
          <p className="text-sm font-medium">
            You are browsing in donor/patient mode. Elevate to a hospital
            reviewer to unlock actions.
          </p>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {queue.length === 0 ? (
          <GlassCard className="bg-white/60 text-[var(--mf-navy)]">
            <p className="font-medium">No pending cases — incredible work.</p>
            <p className="mt-2 text-sm text-[var(--mf-ink)]/70">
              New emergencies appear here the moment patients submit proofs.
            </p>
          </GlassCard>
        ) : (
          queue.map((c) => <HospitalVerificationCard key={c.id} campaign={c} />)
        )}
      </div>
    </div>
  );
}
