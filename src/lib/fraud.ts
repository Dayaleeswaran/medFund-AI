import type { Campaign } from "@/types";

export type FraudAnalysis = {
  fraudScore: number;
  trustScore: number;
  alerts: string[];
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** Placeholder AI — swap for OpenAI + rules engine in production */
export function analyzeCampaignFraud(campaign: Campaign): FraudAnalysis {
  let fraud = campaign.fraud_score || 0;
  const alerts: string[] = [];

  if (
    campaign.verification_status === "pending_hospital" ||
    campaign.verification_status === "pending_admin"
  ) {
    fraud += 8;
    alerts.push("Verification still pending — escrow holds release");
  }
  if (campaign.urgency === "critical" && campaign.donor_count < 50) {
    fraud += 5;
    alerts.push(
      "High urgency with low donor history — manual review suggested",
    );
  }
  if ((campaign.description?.length ?? 0) < 40) {
    fraud += 6;
    alerts.push("Thin narrative — request clinician notes");
  }

  fraud = clamp(fraud + Math.random() * 4 - 2, 0, 100);
  const trust = clamp(
    100 - fraud + (campaign.verification_status === "approved" ? 12 : 0),
    0,
    100,
  );

  if (fraud > 28) alerts.push("Elevated risk — AI holding instant payout");

  return {
    fraudScore: Math.round(fraud),
    trustScore: Math.round(trust),
    alerts: Array.from(new Set(alerts)),
  };
}

export function mergeCampaignFraudWithFintech(
  campaign: Campaign,
  fintech: { fraudDelta: number; alerts: string[] },
): FraudAnalysis {
  const base = analyzeCampaignFraud(campaign);
  const fraud = clamp(base.fraudScore + fintech.fraudDelta, 0, 100);
  const trust = clamp(base.trustScore - fintech.fraudDelta, 0, 100);
  return {
    fraudScore: Math.round(fraud),
    trustScore: Math.round(trust),
    alerts: Array.from(new Set([...base.alerts, ...fintech.alerts])),
  };
}
