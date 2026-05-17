"use client";

import { notFound, useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Landmark } from "lucide-react";
import { useCampaignStore } from "@/store/campaign-store";
import { useAuthStore } from "@/store/auth-store";
import { FraudScoreCard } from "@/components/FraudScoreCard";
import { DonationModal } from "@/components/DonationModal";
import { PayoutModal } from "@/components/PayoutModal";
import { GlowButton } from "@/components/GlowButton";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { mergeCampaignFraudWithFintech } from "@/lib/fraud";
import { formatCurrency } from "@/lib/utils";
import { useFintechEventsStore } from "@/store/fintech-events-store";
import { Button } from "@/components/ui/button";
import { CampaignAudioPlayer } from "@/components/CampaignAudioPlayer";
import { RecommendedCampaigns } from "@/components/RecommendedCampaigns";
import { AiSummaryBox } from "@/components/AiSummaryBox";

export default function CampaignDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id));
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "donator";
  const applyDonation = useCampaignStore((s) => s.applyDonation);

  const getSignalsForCampaign = useFintechEventsStore((s) => s.signalsForCampaign);
  const [fintechSignals, setFintechSignals] = useState({ fraudDelta: 0, alerts: [] as string[] });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFintechSignals(getSignalsForCampaign(id));
  }, [getSignalsForCampaign, id]);

  useEffect(() => {
    const success = searchParams.get("ipg_success");
    const error = searchParams.get("ipg_error");
    
    if (success) {
      toast.success("Payment Gateway Transaction Successful!");
      router.replace(`/campaign/${id}`);
    } else if (error) {
      toast.error(`Payment Gateway Error: ${error}`);
      router.replace(`/campaign/${id}`);
    }
  }, [searchParams, id, router]);

  if (!mounted) return null; // Prevent hydration mismatch

  if (!campaign) notFound();

  const fraud = mergeCampaignFraudWithFintech(campaign, fintechSignals);
  const signals = fraud.alerts.slice(0, 4);

  const pct = Math.min(
    100,
    Math.round((campaign.raised_amount / campaign.target_amount) * 100),
  );

  const canPayout =
    campaign.verification_status === "approved" && campaign.status === "active";

  return (
    <div className="space-y-8 text-white">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to live floor
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)]"
      >
        <GlassCard className="border-white/20 bg-[#061f36]/80">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/75">
            {campaign.hospital_name}
          </p>
          <div className="flex items-center justify-between mt-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {campaign.title}
            </h1>
            <CampaignAudioPlayer text={campaign.description || ""} />
          </div>
          <p className="mt-2 text-lg text-white/80">
            Supporting{" "}
            <span className="font-semibold text-white">{campaign.patient_name}</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {campaign.description}
          </p>
          <AiSummaryBox text={campaign.description || ""} />

          <div className="mt-10">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-medium text-white/50 uppercase tracking-widest">Raised</p>
                <p className="mt-2 text-4xl font-bold text-white tracking-tight">
                  {formatCurrency(campaign.raised_amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white/50 uppercase tracking-widest">Goal</p>
                <p className="mt-2 text-4xl font-bold text-white/80 tracking-tight">
                  {formatCurrency(campaign.target_amount)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <AnimatedProgressBar value={pct} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {(role === "donator" || role === "admin") && (
              <div className="relative group w-full sm:w-auto">
                {user && !user.is_verified && (
                  <div className="absolute -top-10 left-0 w-max rounded-lg bg-rose-600 px-2 py-1 text-[10px] opacity-0 transition group-hover:opacity-100">
                    Verify account to donate
                  </div>
                )}
                <DonationModal
                  campaign={campaign}
                  trigger={
                    <GlowButton 
                      type="button" 
                      className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!!user && !user.is_verified}
                    >
                      {user && !user.is_verified ? "Verification pending" : "Donate (live transfer)"}
                    </GlowButton>
                  }
                />
              </div>
            )}
            {canPayout && (role === "hospital" || role === "admin") ? (
              <PayoutModal
                campaign={campaign}
                trigger={
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-14 gap-2 rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15"
                  >
                    <Landmark className="h-4 w-4" />
                    Hospital CEFTS payout
                  </Button>
                }
              />
            ) : null}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <FraudScoreCard
            fraudScore={fraud.fraudScore}
            trustScore={fraud.trustScore}
            alerts={fraud.alerts}
          />
          <GlassCard>
            <p className="text-xs uppercase tracking-widest text-white/55">
              AI signals
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              {signals.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mf-neon)]" />
                  {s}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <RecommendedCampaigns currentCampaignId={campaign.id} />
      </motion.div>
    </div>
  );
}
