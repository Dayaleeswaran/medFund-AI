"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCampaignStore } from "@/store/campaign-store";
import { useUserStore } from "@/store/user-store";
import { HospitalVerificationCard } from "@/components/HospitalVerificationCard";
import { HospitalRegistrationForm } from "@/components/HospitalRegistrationForm";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, Users, Building2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "campaigns" | "users" | "hospitals";

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const { users, verifyUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>("campaigns");

  const campaignQueue = useMemo(() => {
    if (user?.role === "hospital") {
      return campaigns.filter((c) => c.verification_status === "pending_hospital");
    }
    if (user?.role === "admin") {
      return campaigns.filter((c) => c.verification_status === "pending_admin");
    }
    return [];
  }, [campaigns, user?.role]);

  const userQueue = useMemo(() => {
    return users.filter((u) => !u.is_verified && (u.role === "donator" || u.role === "fund_raiser"));
  }, [users]);

  const hospitalList = useMemo(() => {
    return users.filter((u) => u.role === "hospital");
  }, [users]);

  function toggleDemoRole() {
    if (!user) return;
    if (user.role === "admin") {
      setUser({ ...user, role: "fund_raiser" });
      toast.success("Switched to Fundraiser mode (demo)");
    } else if (user.role === "hospital") {
      setUser({ ...user, role: "admin" });
      toast.success("Switched to Admin mode (demo)");
    } else {
      setUser({ ...user, role: "hospital" });
      toast.success("Switched to Hospital mode (demo)");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
            {user?.role === "admin" ? "Systems administration" : "Hospital console"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {user?.role === "admin"
              ? "Command Center"
              : "Attest emergency fundraisers"}
          </h1>
        </div>
        <Button
          variant="secondary"
          className="rounded-2xl border-[var(--mf-navy)]/15 bg-white/70 text-[var(--mf-navy)]"
          onClick={toggleDemoRole}
        >
          Toggle demo role ({user?.role})
        </Button>
      </div>

      {/* Admin Tabs */}
      {user?.role === "admin" && (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-white/10 p-1">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition",
              activeTab === "campaigns" ? "bg-white text-[var(--mf-navy)] shadow-sm" : "text-white/60 hover:bg-white/5"
            )}
          >
            <Shield className="h-4 w-4" />
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition",
              activeTab === "users" ? "bg-white text-[var(--mf-navy)] shadow-sm" : "text-white/60 hover:bg-white/5"
            )}
          >
            <Users className="h-4 w-4" />
            User Approvals {userQueue.length > 0 && `(${userQueue.length})`}
          </button>
          <button
            onClick={() => setActiveTab("hospitals")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition",
              activeTab === "hospitals" ? "bg-white text-[var(--mf-navy)] shadow-sm" : "text-white/60 hover:bg-white/5"
            )}
          >
            <Building2 className="h-4 w-4" />
            Hospital Network
          </button>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === "campaigns" && (
          <div className="grid gap-4 md:grid-cols-2">
            {campaignQueue.length === 0 ? (
              <GlassCard className="bg-white/60 text-[var(--mf-navy)] col-span-2 text-center py-12">
                <p className="font-medium">No pending cases — incredible work.</p>
                <p className="mt-2 text-sm text-[var(--mf-ink)]/70">
                  New emergencies appear here the moment patients submit proofs.
                </p>
              </GlassCard>
            ) : (
              campaignQueue.map((c) => <HospitalVerificationCard key={c.id} campaign={c} />)
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            {userQueue.length === 0 ? (
              <GlassCard className="bg-white/60 text-[var(--mf-navy)] text-center py-12">
                <p className="font-medium">All users are verified.</p>
              </GlassCard>
            ) : (
              userQueue.map((u) => (
                <GlassCard key={u.id} className="flex items-center justify-between bg-white/70">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                      {u.full_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--mf-navy)]">{u.full_name}</p>
                      <p className="text-xs text-[var(--mf-ink)]/60 capitalize">{u.role.replace("_", " ")}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      verifyUser(u.id);
                      toast.success(`${u.full_name} verified.`);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Verify Account
                  </Button>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {activeTab === "hospitals" && (
          <div className="grid gap-6 md:grid-cols-2">
            <HospitalRegistrationForm />
            <GlassCard className="bg-[var(--mf-navy)]/90 text-white">
              <h3 className="text-lg font-semibold">Verified Network</h3>
              <div className="mt-4 space-y-3">
                {hospitalList.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-cyan-400" />
                      {h.full_name}
                    </div>
                    <span className="text-[10px] uppercase text-cyan-300">Verified Partner</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
