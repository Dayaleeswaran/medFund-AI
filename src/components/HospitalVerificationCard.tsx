"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Stethoscope, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import type { Campaign } from "@/types";
import { useCampaignStore } from "@/store/campaign-store";
import { useAuthStore } from "@/store/auth-store";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export function HospitalVerificationCard({
  campaign,
}: {
  campaign: Campaign;
}) {
  const patch = useCampaignStore((s) => s.patchCampaign);
  const user = useAuthStore((s) => s.user);

  function approve() {
    if (user?.role === "hospital") {
      patch(campaign.id, {
        verification_status: "pending_admin",
        fraud_score: Math.max(5, campaign.fraud_score - 4),
        trust_score: Math.min(100, campaign.trust_score + 5),
      });
      toast.success("Attestation signed — forwarded for Admin review");
    } else if (user?.role === "admin") {
      patch(campaign.id, {
        verification_status: "approved",
        status: "active",
        fraud_score: Math.max(5, campaign.fraud_score - 8),
        trust_score: Math.min(100, campaign.trust_score + 10),
      });
      toast.success("Campaign approved — now live for donors");
    }
  }

  function reject() {
    patch(campaign.id, {
      verification_status: "rejected",
      status: "rejected",
      fraud_score: Math.min(100, campaign.fraud_score + 15),
    });
    toast("Campaign held — care team notified", { icon: "⏸️" });
  }

  const isPendingHospital = campaign.verification_status === "pending_hospital";
  const isPendingAdmin = campaign.verification_status === "pending_admin";
  const canApprove =
    (user?.role === "hospital" && isPendingHospital) ||
    (user?.role === "admin" && isPendingAdmin);

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-200/80">
            {campaign.hospital_name}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {campaign.patient_name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/65">
            {campaign.title}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase",
            isPendingHospital || isPendingAdmin
              ? "bg-amber-400/20 text-amber-100"
              : campaign.verification_status === "approved"
                ? "bg-emerald-500/20 text-emerald-100"
                : "bg-red-500/20 text-red-100",
          )}
        >
          {campaign.verification_status.replace("_", " ")}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="gap-2"
          disabled={!canApprove}
          onClick={approve}
        >
          <CheckCircle2 className="h-4 w-4" />
          {user?.role === "admin" ? "Final Approve" : "Sign Attestation"}
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="gap-2"
          disabled={!canApprove}
          onClick={reject}
        >
          <XCircle className="h-4 w-4" />
          Reject & flag
        </Button>
      </div>

      <motion.div
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60"
        animate={{ opacity: canApprove ? 1 : 0.65 }}
      >
        <Stethoscope className="h-4 w-4 text-[var(--mf-neon)]" />
        Notes sync to MediFund ledger + AI re-scores within seconds.
      </motion.div>
    </GlassCard>
  );
}
