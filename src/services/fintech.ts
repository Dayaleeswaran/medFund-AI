import type { Donation } from "@/types";

export type PaymentIntentResult = {
  id: string;
  status: "requires_confirmation" | "succeeded" | "failed";
  clientSecret?: string;
};

/** Sandbox-ready fintech layer — replace with Stripe / Adyen */
export async function createPaymentIntent(args: {
  amount: number;
  currency: string;
  campaignId: string;
  donorLabel?: string;
}): Promise<PaymentIntentResult> {
  await new Promise((r) => setTimeout(r, 600));
  if (args.amount <= 0) {
    return { id: `pi_invalid`, status: "failed" };
  }
  return {
    id: `pi_sandbox_${Date.now()}`,
    status: "succeeded",
    clientSecret: `sandbox_cs_${args.campaignId}`,
  };
}

export async function confirmPayment(
  intentId: string,
): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: intentId.startsWith("pi_") };
}

export function buildDonationRecord(
  campaignId: string,
  amount: number,
  donorId: string | null,
): Donation {
  return {
    id: `don_${Date.now()}`,
    campaign_id: campaignId,
    donor_id: donorId,
    amount,
    status: "completed",
    payment_ref: `ref_${Math.random().toString(36).slice(2, 10)}`,
    created_at: new Date().toISOString(),
  };
}
