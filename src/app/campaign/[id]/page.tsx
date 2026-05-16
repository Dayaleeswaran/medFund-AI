"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Landmark } from "lucide-react";
import { useCampaignStore } from "@/store/campaign-store";
import { FraudScoreCard } from "@/components/FraudScoreCard";
import { DonationModal } from "@/components/DonationModal";
import { PayoutModal } from "@/components/PayoutModal";
import { GlowButton } from "@/components/GlowButton";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { mergeCampaignFraudWithFintech } from "@/lib/fraud";
import { MOCK_RISK_BY_CAMPAIGN } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useFintechEventsStore } from "@/store/fintech-events-store";
import { Button } from "@/components/ui/button";

export default function CampaignDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id));

  const fintechSignals = useFintechEventsStore((s) =>
    s.signalsForCampaign(id),
  );

  if (!campaign) notFound();

  const fraud = mergeCampaignFraudWithFintech(campaign, fintechSignals);
  const signals =
    MOCK_RISK_BY_CAMPAIGN[campaign.id]?.signals ?? fraud.alerts.slice(0, 4);

  const pct = Math.min(
    100,
    Math.round((campaign.raised_amount / campaign.target_amount) * 100),
  );

  const canPayout =
    campaign.verification_status === "verified" && campaign.status === "active";

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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {campaign.title}
          </h1>
          <p className="mt-2 text-lg text-white/80">
            Supporting{" "}
            <span className="font-semibold text-white">{campaign.patient_name}</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {campaign.description}
          </p>

          <div className="mt-6">
            <AnimatedProgressBar value={pct} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-white/55">Raised</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(campaign.raised_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/55">Goal</p>
              <p className="text-2xl font-semibold text-white/90">
                {formatCurrency(campaign.target_amount)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <DonationModal
              campaign={campaign}
              trigger={
                <GlowButton type="button" className="w-full sm:w-auto">
                  Donate (live transfer)
                </GlowButton>
              }
            />
            {canPayout ? (
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
    </div>
  );
}
